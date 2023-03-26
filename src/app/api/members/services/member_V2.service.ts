import CommonService from '../../../utils/common.service';
import MemberGroupMap from '../../../../models/MemberGroupMap';
import PaymentTable from '../../../../models/PaymentTable';
import GroupSubscriptionPlans from '../../../../models/GroupSubscriptionPlan';
import User from '../../../../models/User';
import freshchatService from '../../../../app/utils/freshchat/freshchat.service';
import GroupDetails from '../../../../models/GroupDetail';
import memberService from './member.service';

const { ResponseBuilder } = require('base-packages');

class MemberServiceV2 extends CommonService {
    async addMemberPlans(data: any) {
        try {
            const members = await MemberGroupMap.findAll({
                where: {
                    status: 'success'
                },
                order: [['createdAt', 'DESC']],
                limit: Number(data.limit) || 0,
                offset: Number(data.offset) || 0,
                raw: true,
                logging: true
            });

            for (let i = 0; i < members.length; i++) {
                // console.log('looping', i);
                const [groupPlans, payments] = await Promise.all([
                    GroupSubscriptionPlans.findAll({
                        where: {
                            groupId: members[i].groupId
                        },
                        raw: true
                    }),
                    PaymentTable.findAll({
                        where: {
                            buyerId: members[i].memberId,
                            groupId: members[i].groupId
                        },
                        raw: true
                    })
                ]);
                if (!groupPlans) {
                    continue;
                }
                const currentPlan =
                    members[i].currentPlan !== '' &&
                    JSON.parse(members[i].currentPlan);

                if (!currentPlan || !groupPlans.length) {
                    continue;
                }
                const memberPlan = groupPlans.find((plan) => {
                    if (currentPlan.periodTitle) {
                        return (
                            plan.selectedPeriod ===
                                currentPlan.selectedPeriod &&
                            plan.periodTitle === currentPlan.periodTitle
                        );
                    }

                    return plan.selectedPeriod === currentPlan.selectedPeriod;
                });
                // console.log(memberPlan);
                if (!memberPlan) {
                    continue;
                }
                await MemberGroupMap.update(
                    {
                        planId: memberPlan.id
                    },
                    {
                        where: {
                            memberId: members[i].memberId,
                            groupId: members[i].groupId
                        }
                    }
                );

                if (payments.length) {
                    await Promise.allSettled(
                        payments.map((payment) => {
                            const currentPlan =
                                payment.currentPlan &&
                                JSON.parse(payment.currentPlan);
                            const memberPlan =
                                payment.currentPlan &&
                                groupPlans.find((plan) => {
                                    if (currentPlan.periodTitle) {
                                        return (
                                            plan.selectedPeriod ===
                                                currentPlan.selectedPeriod &&
                                            plan.periodTitle ===
                                                currentPlan.periodTitle
                                        );
                                    }

                                    return (
                                        plan.selectedPeriod ===
                                        currentPlan.selectedPeriod
                                    );
                                });
                            return (
                                memberPlan &&
                                PaymentTable.update(
                                    {
                                        planId: memberPlan.id
                                    },
                                    {
                                        where: {
                                            id: payment.id
                                        }
                                    }
                                )
                            );
                        })
                    );
                }
            }
            return members;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async renewalTriggerScript(data: any) {
        try {
            const successNumbers = [];
            const failedNumbers = [];
            for (let item of data) {
                const [user, group] = await Promise.all([
                    User.findOne({
                        where: {
                            mobile: item.mobile
                        }
                    }),
                    GroupDetails.findByPk(Number(item.groupId))
                ]);

                if (!user || !group) {
                    failedNumbers.push(item.mobile);
                    continue;
                }

                const memberShip = await MemberGroupMap.findOne({
                    where: {
                        memberId: user.id,
                        groupId: group.id
                    }
                });
                if (!memberShip) {
                    failedNumbers.push(item.mobile);
                    continue;
                }

                const encryptMember = await memberService.getEncryptedmember(
                    String(user.id)
                );
                const encryptGroup = await memberService.getEncryptedGroup(
                    String(group.id)
                );
                const preauthLink = `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`;

                freshchatService.sendPlanExpiryFreshchatServiceRequest(
                    user.name,
                    group.groupName,
                    preauthLink,
                    user.mobile,
                    group.id
                );

                successNumbers.push(item.mobile);
            }
            return new ResponseBuilder(
                200,
                {
                    successNumbers,
                    failedNumbers
                },
                'SUCCESS'
            );
        } catch (err) {
            return new ResponseBuilder(
                400,
                { message: err.message },
                'BAD REQUEST'
            );
        }
    }
}

export default new MemberServiceV2();
