import CommonService from '../../../utils/common.service';
import { SUCCESS_200 } from '../../../../config/constants/errorMessages';
import { Op } from 'sequelize';
import PaymentTable from '../../../../models/PaymentTable';
import User from '../../../../models/User';
import GroupSubscriptionPlans from '../../../../models/GroupSubscriptionPlan';
import GroupDetails from '../../../../models/GroupDetail';
import MemberGroupMap from '../../../../models/MemberGroupMap';

class SearchUserService extends CommonService {
    async searchUser(data: any) {
        try {
            const { mobile, groupId } = data;

            const users = await User.findAll({
                where: {
                    mobile: {
                        [Op.like]: `%${mobile}%`
                    }
                },
                attributes: ['id'],
                raw: true
            });

            if (!users.length) {
                return {
                    statusCode: 200,
                    data: [],
                    message: SUCCESS_200
                };
            }
            const userIds = users.map((user) => user.id);
            const result = await PaymentTable.findAll({
                where: {
                    groupId: groupId,
                    buyerId: {
                        [Op.in]: userIds
                    }
                },
                order: [['createdAt', 'desc']],
                include: [
                    {
                        model: User,
                        attributes: ['name', 'mobile', 'email']
                    },
                    {
                        model: GroupSubscriptionPlans
                    },
                    {
                        model: GroupDetails,
                        attributes: ['logoUrl']
                    }
                ],
                attributes: [
                    'createdAt',
                    'amount',
                    'buyerId',
                    'fankonnectCommission',
                    'currentPlan',
                    'migrated',
                    'renewed',
                    'planId',
                    'couponName',
                    'couponDiscount'
                ]
            });
            const checkingUser = {};
            const finalResult = [];

            for (let user of result) {
                if (checkingUser[user['dataValues'].buyerId]) {
                    const index = result.indexOf(user);
                    result.splice(index, index);
                    continue;
                }
                const memberData = await MemberGroupMap.findOne({
                    where: {
                        memberId: user['dataValues'].buyerId,
                        groupId: groupId
                    },
                    raw: true,
                    attributes: ['joinedBy', 'isLeft']
                });

                checkingUser[user['dataValues'].buyerId] = 1;
                const currentPlan =
                    user.currentPlan && JSON.parse(user.currentPlan);
                finalResult.push({
                    ...user['dataValues'],
                    amount:
                        user['dataValues'].amount -
                        user['dataValues'].fankonnectCommission,
                    joinedBy: memberData ? memberData.joinedBy : null,
                    isLeft: memberData ? memberData.isLeft : 0,
                    ...(currentPlan && { orignalPrice: currentPlan.price }),
                    ...(currentPlan && { planDiscount: currentPlan.discount })
                });
            }

            return {
                statusCode: 200,
                data: finalResult,
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new SearchUserService();
