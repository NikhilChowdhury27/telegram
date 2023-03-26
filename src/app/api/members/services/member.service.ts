import MemberGroupMapRepository from '../../../repository/member.group.map';
import CommonService from '../../../utils/common.service';
const { ResponseBuilder } = require('base-packages');
import { IListMember } from '../member.interface';
import { DATA_FETCHED_SUCCESSFULLY } from '../../../../config/constants/errorMessages';
import Telegram from '../../../utils/telegram/telegram.common';

import Group from '../../../utils/group';
// import GroupConst from '../../../../config/constants/group';
// const bPromise = require('bluebird');
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../../../sequelize';
import GroupDetailsRepository from '../../../repository/group.repository';
import groupBotRepository from '../../../repository/group.bot.map.repository';
import * as moment from 'moment';
import { sign, SignOptions } from 'jsonwebtoken';
import memberGroupMap from '../../../repository/member.group.map';
import { IPricing } from '../../groups/group.interface';
import Common from '../../../../config/constants/common';
import RedisManager from '../../../../config/conf/RedisCache';
import FreshchatService from '../../../utils/freshchat/freshchat.service';
import GroupPlanRepository from '../../../repository/group.subscription.plan';
import whatsappConfig from '../../../../app/utils/whatsapp/whatsapp.config';
import phoneIdRepository from '../../../../app/repository/phone.id.repository';
import { randomIntFromInterval } from '../../../../app/utils/api.utils';
import {
    additionRateDifference,
    WHATSAPP_USER_ADDITION
} from '../../../../config/constant';
import { sendNotificationToGoogleChat } from '../../../../app/utils/alert.utils';
import freshchatService from '../../../utils/freshchat/freshchat.service';
import groupService from '../../groups/services/group';

class MemberService extends CommonService {
    async list(filter: IListMember) {
        filter.limit = filter.limit ? Number(filter.limit) : 10;
        filter.offset = filter.offset ? Number(filter.offset) : 0;
        filter.groupId = Number(filter.groupId);
        const [groupDetails, result] = await Promise.all([
            GroupDetailsRepository.findGroupById(filter.groupId),
            MemberGroupMapRepository.list(filter)
        ]);
        return new ResponseBuilder(
            200,
            {
                totalRevenue: groupDetails.totalRevenue,
                totalMembers: Number(groupDetails.memberCount || 0),
                members: result
            },
            DATA_FETCHED_SUCCESSFULLY
        );
    }

    async expiryReminder() {
        try {
            const dates = [];
            dates.push(moment().add(5, 'days').format('YYYY-MM-DD'));
            dates.push(moment().add(3, 'days').format('YYYY-MM-DD'));
            dates.push(moment().add(1, 'days').format('YYYY-MM-DD'));
            let offset = 0;
            const members: any =
                await MemberGroupMapRepository.membersAboutToEx(
                    dates,
                    offset,
                    1000
                );
            const payload = {
                clientId: process.env.COMM_SERVICE_CLIENT_ID,
                clientSecret: process.env.COMM_SERVICE_CLIENT_SECRET
            };
            const token = sign(payload, process.env.COMM_TOKEN_SECRET, <
                SignOptions
            >{
                expiresIn: process.env.COMM_TOKEN_EXPIRY_DURATION,
                algorithm: process.env.COMM_ACCESS_TOKEN_ALGO
            });
            console.log('Mesaage service token', token);
            for (let m of members) {
                const given = moment(m.expiryDate, 'YYYY-MM-DD');
                const current = moment().startOf('day');
                const actualDays = moment
                    .duration(given.diff(current))
                    .asDays();
                const encryptMember = await this.getEncryptedmember(
                    String(m.userId)
                );
                const encryptGroup = await this.getEncryptedGroup(
                    String(m.groupId)
                );
                try {
                    const templateData = {
                        customerName: m.name,
                        groupName: m.groupName,
                        expireDays: actualDays,
                        paymentLink: `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`
                    };
                    const message = await Group.sendSms(
                        [m.mobile],
                        m.userId,
                        token,
                        m.groupId,
                        templateData,
                        process.env.COMM_ACCESS_SMS_GROUP_EXPIRY_TEMPLATE,
                        'expiryreminder'
                    );

                    const emailTemplate = {
                        userName: m.name,
                        groupName: m.groupName,
                        renewNowLink: `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`,
                        adminName: m.creatorName,
                        numberOfDays: actualDays
                    };
                    const email =
                        m.email &&
                        (await Group.sendEmail(
                            [m.email],
                            process.env.COMM_ACCESS_EMAIL_EXPIRY_SUBJECT,
                            Number(
                                process.env
                                    .COMM_ACCESS_EMAIL_EXPIRY_SUBJECT_TEMPLATE
                            ),
                            token,
                            emailTemplate
                        ));
                    if (
                        m.whatsappStatus &&
                        (m.type == 'telegramChannel' ||
                            m.type == 'telegramExisting')
                    ) {
                        FreshchatService.sendPaymentReminderFreshchatServiceRequest(
                            m.name,
                            m.groupName,
                            String(actualDays),
                            `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`,
                            m.mobile,
                            m.groupId
                        );
                    }
                    if (
                        m.type == 'whatsappGroup' ||
                        m.type == 'whatsappCommunity'
                    ) {
                        let type =
                            m.type == 'whatsappGroup'
                                ? 'Whatsapp Group'
                                : 'Whatsapp Community';
                        FreshchatService.sendWAReminderFreshchatServiceRequest(
                            m.name,
                            m.groupName,
                            type,
                            String(actualDays),
                            `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`,
                            m.mobile,
                            m.groupId
                        );
                    }
                    if ((message && message.data) || (email && email.data)) {
                        await memberGroupMap.updateGroupMemberCronStatus(
                            m.userId,
                            m.groupId,
                            'success'
                        );
                    }
                } catch (e) {
                    await memberGroupMap.updateGroupMemberCronStatus(
                        m.userId,
                        m.groupId,
                        'failed'
                    );
                }
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    async retryAdd() {
        try {
            const usersToRetryAdd: any = await sequelize.query(
                `
				SELECT mgm.id, mgm.status, u.telegramAccessHash, u.whatsappStatus,  mgm.currentPlan, mgm.groupId as groupId , u.id as userId, u.name as userName , cd.name as creatorName, u.mobile, u.email,  u.telegramUserId, gd.channelHash, gd.channelId, gd.groupName as channelName, mgm.expiryDate, mgm.expiryTimestamp, mgm.groupId, mgm.memberId, mgm.isLeft
				from member_group_map mgm 
				INNER JOIN users u ON u.id = mgm.memberId 
				INNER JOIN group_details gd ON gd.id = mgm.groupId
				INNER JOIN users cd on cd.id = gd.createdBy
				WHERE (mgm.status in ('pending','migrating') OR mgm.isLeft=1) AND mgm.inviteLink IS NULL AND gd.type IN ('telegramExisting', 'telegramChannel')  ORDER BY mgm.createdAt DESC limit 25; `,
                { type: QueryTypes.SELECT }
            );
            console.log('users to be added ', usersToRetryAdd);
            // const filter = {
            //     isAdded: 0
            // };

            // const projection = ['id'];
            // const usersToRetryAdd =
            //     await MemberGroupMapRepository.getJoinedData(
            //         filter,
            //         projection
            //     );
            // let promiseArray = [];

            // for (let idx = 0; idx < usersToRetryAdd.length; idx++) {
            //     const payload = {
            //         channelId: usersToRetryAdd[idx].group.channelId,
            //         channelHash: usersToRetryAdd[idx].group.channelHash,
            //         telegramUserId: usersToRetryAdd[idx].user.telegramUserId,
            //         telegramAccessHash: usersToRetryAdd[idx].user.telegramAccessHash
            //     };

            //     promiseArray.push(telegram.addUserToChannel(payload));
            // }

            // await bPromise.map(
            //     usersToRetryAdd,
            //     async (value, idx) => {
            //         const payload = {
            //             channelId: value.channelId,
            //             channelHash: value.channelHash,
            //             telegramUserId: value.telegramUserId,
            //             telegramAccessHash: value.telegramAccessHash
            //         };
            //         return telegram.addUserToChannel(payload);
            //     },
            //     { concurrency: 1 }
            // );
            for (const value of usersToRetryAdd) {
                // if (!value.telegramUserId) {
                //     const telegramUserRes: any =
                //         await Telegram.checkAndUpdateUser({
                //             mobile: value.mobile,
                //             userId: value.userId
                //         });

                //     if (!telegramUserRes && !telegramUserRes.id) {
                //         continue;
                //     }
                //     value.telegramUserId = telegramUserRes.id;
                //     value.telegramAccessHash = telegramUserRes.accessHash;
                // }

                // const payload = {
                //     channelId: value.channelId,
                //     channelHash: value.channelHash,
                //     telegramUserId: value.telegramUserId,
                //     telegramAccessHash: value.telegramAccessHash
                // };
                // await groupService.addUserToGroupCallback({
                //     telegramPayload: payload,
                //     member: {
                //         groupId: value.groupId,
                //         memberId: value.memberId,
                //         expiryDate: value.expiryDate,
                //         expiryTimestamp: value.expiryTimestamp
                //     },
                // session: {
                //     session: value.session,
                //     apiId: value.apiId,
                //     apiHash: value.apiHash
                // }
                // });
                const botToken = await groupBotRepository.findOne({
                    groupId: value.groupId,
                    isActive: 1,
                    isPrimary: 1
                });

                // const redisLink = await RedisManager.popFromSet(
                //     String(value.groupId),
                //     1
                // );

                const inviteLink = await Telegram.createInviteLinkBot(
                    value.channelId,
                    botToken.botToken.token
                );

                // await Telegram.createInviteLink(
                //     {
                //         channelId: value.channelId,
                //         channelHash: value.channelHash
                //     },
                //     {
                //         session: value.session,
                //         apiId: value.apiId,
                //         apiHash: value.apiHash
                //     },
                //     undefined
                // );
                if (!inviteLink) {
                    continue;
                }
                await memberGroupMap.updateGroupMemberdata(
                    {
                        groupId: value.groupId,
                        memberId: value.memberId
                    },
                    {
                        inviteLink: inviteLink
                    }
                );

                const emailTemplateData = {
                    userName: value.userName,
                    groupName: value.channelName,
                    adminName: value.creatorName,
                    inviteLink: inviteLink.replace('t.me', 'telegram.me')
                };

                if (value.isLeft == 0) {
                    if (inviteLink) {
                        RedisManager.addToHashmap(inviteLink, {
                            groupName: '',
                            name: value.userName,
                            mobile: value.mobile,
                            groupId: value.groupId,
                            userId: value.userId,
                            type: 'member',
                            token: botToken.botToken.token,
                            currentPlan:
                                value.currentPlan !== '' &&
                                JSON.parse(value.currentPlan),
                            status: value.status
                        });
                    }
                    await Group.sendSms(
                        [value.mobile],
                        value.userId,
                        undefined,
                        value.groupId,
                        {
                            userName: value.userName,
                            inviteLink: encodeURIComponent(
                                encodeURIComponent(inviteLink)
                            ),
                            groupName: value.channelName
                        },
                        process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                        'memberAddition'
                    );
                    if (value.email) {
                        await Group.sendEmail(
                            [value.email],
                            process.env.COMM_ACCESS_EMAIL_GROUP_ADDITION,
                            Number(
                                process.env
                                    .COMM_ACCESS_EMAIL_GROUP_ADDITION_TEMPLATE
                            ),
                            null,
                            emailTemplateData
                        );
                    }
                    if (value.whatsappStatus) {
                        FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                            value.userName,
                            value.channelName,
                            inviteLink.replace('t.me', 'telegram.me'),
                            value.mobile,
                            value.groupId
                        );
                    }
                }
                await Telegram.sleep(7000);
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    async checkMemberStatus() {
        try {
            const usersToCheck: any = await sequelize.query(
                `
				SELECT mgm.id, mgm.updatedAt , mgm.status,  mgm.groupId as groupId ,mgm.inviteLink , mgm.joinedBy, mgm.joinedDate,  u.telegramAccessHash, u.telegramUserId, u.mobile, u.id as userId, gd.channelHash,
				gd.channelId, mgm.expiryDate, mgm.expiryTimestamp, mgm.memberId, st.session, st.apiId, st.apiHash,
				 mgm.currentPlan
			   from member_group_map mgm
			   INNER JOIN users u ON u.id = mgm.memberId
			   INNER JOIN group_details gd ON gd.id = mgm.groupId
			   INNER JOIN session_token st ON st.id = gd.sessionId
			   WHERE mgm.status in ('pending','migrating') AND mgm.inviteLink IS NOT NULL ORDER BY mgm.updatedAt DESC limit 50;`,
                { type: QueryTypes.SELECT }
            );
            await RedisManager.incrCount('checkMember');
            console.log('users to be checked ', usersToCheck.length);
            for (const value of usersToCheck) {
                // if (!value.telegramUserId) {
                //     const telegramUserRes: any =
                //         await Telegram.checkAndUpdateUser({
                //             mobile: value.mobile,
                //             id: value.userId
                //         });

                //     if (!telegramUserRes && !telegramUserRes.id) {
                //         continue;
                //     }
                //     value.telegramUserId = telegramUserRes.id;
                //     value.telegramAccessHash = telegramUserRes.accessHash;
                // }

                // const payload = {
                //     channelId: value.channelId,
                //     // channelHash: value.channelHash,
                //     telegramUserId: value.telegramUserId,
                //     // telegramAccessHash: value.telegramAccessHash,
                //     mobile: value.mobile,
                //     id: value.userId,
                //     updatedAt: value.updatedAt,
                //     groupId: value.groupId,
                //     inviteLink: value.inviteLink,
                //     memberId: value.memberId
                // };
                const result = Boolean(value.joinedBy);
                // await Telegram.findAdminAndUpdateAdminRights(
                //     payload,
                //     false
                // );
                let expiryDate;
                let expiryTimestamp;

                const subscriptionPlan: IPricing =
                    value.currentPlan !== '' && JSON.parse(value.currentPlan);

                if (
                    subscriptionPlan.selectedPeriod &&
                    subscriptionPlan.selectedPeriod !== 'Lifetime' &&
                    value.status !== 'migrating'
                ) {
                    const days =
                        Common.SUBSCRIPTION_MAPPING[
                            `${subscriptionPlan.selectedPeriod}`
                        ];
                    console.log('DAYS', days);

                    if (result) {
                        expiryDate = value.joinedDate
                            ? moment(value.joinedDate)
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD')
                            : moment().add(days, 'days').format('YYYY-MM-DD');

                        expiryTimestamp = value.joinedDate
                            ? moment(value.joinedDate)
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD HH:mm:ss')
                            : moment()
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD HH:mm:ss');
                    }
                }

                const memberPayload = {
                    status: 'success',
                    isAdded: 1,
                    isActive: 1
                };

                if (value.status !== 'migrating' && expiryDate) {
                    memberPayload['expiryDate'] = expiryDate;
                    memberPayload['expiryTimestamp'] = expiryTimestamp;
                }

                result &&
                    (await MemberGroupMapRepository.updateGroupMemberInfo(
                        value.memberId,
                        value.groupId,
                        memberPayload
                    ));
            }
            await RedisManager.decrCount('checkMember');

            await Telegram.sleep(10000);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async calculateExpiry(
        memberId: number,
        groupId: number,
        joiningDate: Date,
        currentPlan: any,
        status: any,
        planId?: number
    ) {
        // const member =
        //     await MemberGroupMapRepository.hasMemberJoinedGroupAndAdded(
        //         groupId,
        //         memberId
        //     );
        // const subscriptionPlan: IPricing =
        //     member.currentPlan !== '' && JSON.parse(member.currentPlan);
        if (
            status === 'migrating' ||
            status === 'left' ||
            !currentPlan.selectedPeriod ||
            currentPlan.selectedPeriod === 'Lifetime'
        ) {
            return false;
        }
        // const plankey = `planId-${planId}`;
        if (planId) {
            // await RedisManager.getFromHashmap(plankey);

            const planData = await GroupPlanRepository.findPlanById(planId);
            const data = {
                selectedPeriod: planData.selectedPeriod
            };
            if (planData.customValue) {
                data['customValue'] = planData.customValue;
            }
            if (planData.customType) {
                data['customType'] = planData.customType;
            }
            await RedisManager.addToHashmap(`planId-${planId}`, data);

            currentPlan = planData;
        }

        const days =
            currentPlan.selectedPeriod == 'Custom Period'
                ? Common.CUSTOM_SUBSCRIPTION_MAPPING[
                      `${currentPlan.customType}`
                  ] * currentPlan.customValue
                : Common.SUBSCRIPTION_MAPPING[`${currentPlan.selectedPeriod}`];
        console.log('DAYS', days);
        const expiryDate = joiningDate
            ? moment(joiningDate).add(days, 'days').format('YYYY-MM-DD')
            : moment().add(days, 'days').format('YYYY-MM-DD');

        const expiryTimestamp = joiningDate
            ? moment(joiningDate)
                  .add(days, 'days')
                  .format('YYYY-MM-DD HH:mm:ss')
            : moment().add(days, 'days').format('YYYY-MM-DD HH:mm:ss');

        if (!expiryDate || !expiryTimestamp) {
            return false;
        }
        return {
            expiryDate: expiryDate,
            expiryTimestamp: expiryTimestamp
        };
    }

    async getInviteLink(linkMatch: string) {
        try {
            const inviteLinks: any = await sequelize.query(
                `
				SELECT memberId, mgm.groupId, token, mgm.currentPlan, mgm.inviteLink, mgm.planId, mgm.status, mgm.planId FROM member_group_map mgm JOIN group_bot_map gbm ON gbm.groupId=mgm.groupId JOIN bot_token bt ON bt.id=gbm.botTokenId WHERE gbm.isPrimary=1 AND inviteLink LIKE '${linkMatch}%';
				`,
                { type: QueryTypes.SELECT }
            );

            return inviteLinks.length && inviteLinks[0];
        } catch (error) {
            throw error;
        }
    }

    async updateJoiningInfo(memberId: number, groupId: number, payload: any) {
        await memberGroupMap.updateGroupMemberInfo(memberId, groupId, payload);
    }

    async findMember(filter: any) {
        try {
            const inviteLinks: any = await sequelize.query(
                `
                SELECT memberId, mgm.groupId, gd.channelId FROM member_group_map mgm JOIN group_details gd ON gd.id=mgm.groupId WHERE gd.channelId=${filter.channelId} AND mgm.joinedBy=${filter.joinedBy};
                `,
                { type: QueryTypes.SELECT }
            );

            return inviteLinks.length && inviteLinks[0];
        } catch (error) {
            throw error;
        }
    }

    async retryAddWhatsapp() {
        try {
            const usersToRetryAdd: any = await sequelize.query(
                `
				SELECT mgm.id, mgm.status, u.telegramAccessHash, u.whatsappStatus,  mgm.currentPlan, mgm.groupId as groupId , u.id as userId, u.name as userName , cd.name as creatorName, u.mobile, u.email,  u.telegramUserId, gd.channelHash,
				gd.channelId, gd.groupName as channelName, mgm.expiryDate, mgm.expiryTimestamp, mgm.groupId, mgm.memberId, mgm.isLeft,
				mgm.planId, gd.type
				from member_group_map mgm 
				INNER JOIN users u ON u.id = mgm.memberId 
				INNER JOIN group_details gd ON gd.id = mgm.groupId
				INNER JOIN users cd on cd.id = gd.createdBy
				WHERE (mgm.status in ('pending','migrating')) AND gd.type IN ('whatsappCommunity', 'whatsappGroup')  ORDER BY RAND() limit 5; `,
                { type: QueryTypes.SELECT }
            );
            console.log('users to be added ', usersToRetryAdd);

            for (const value of usersToRetryAdd) {
                const key = `wa-${value.groupId}-add`;
                const additionRate = await RedisManager.getCount(key);
                if (!additionRate) {
                    groupService.setCurrentTimeInRedis(key);
                } else {
                    const additionRateData = JSON.parse(additionRate);
                    const difference =
                        moment().unix() - additionRateData.startTime;
                    console.log('DIFF', difference);
                    if (difference < additionRateDifference) {
                        continue;
                    }
                    if (difference >= additionRateDifference) {
                        groupService.setCurrentTimeInRedis(key);
                    }
                }
                let data = JSON.stringify({
                    conversation_id: `${value.channelId}@g.us`,
                    number: `${value.mobile}@c.us`
                });

                let primaryNumber = await phoneIdRepository.findActivePhone(
                    value.groupId
                );

                if (!primaryNumber) {
                    primaryNumber = await phoneIdRepository.findNonprimaryPhone(
                        value.groupId
                    );
                }

                if (!primaryNumber) {
                    sendNotificationToGoogleChat(WHATSAPP_USER_ADDITION, {
                        action: 'USER_ADDITION',
                        data: {
                            groupId: value.groupId
                        },
                        reason: 'No Active Business Number found'
                    });
                    continue;
                }

                const addition = await whatsappConfig.addToGroup(
                    data,
                    primaryNumber.phone.phoneId
                );
                console.log('ADDITION', addition);
                if (addition && addition.code == 'W05') {
                    sendNotificationToGoogleChat(WHATSAPP_USER_ADDITION, {
                        action: 'USER_ADDITION',
                        data: {
                            phone: primaryNumber.phone.phone,
                            phoneId: primaryNumber.phone.phoneId
                        },
                        reason: 'BUSINESS NUMBER IS DEACTIVATED FROM MAYTAPI, PLEASE CHECK'
                    });
                }

                if (
                    !addition ||
                    !addition.success ||
                    addition.data.participants[0].code != 200
                ) {
                    sendNotificationToGoogleChat(WHATSAPP_USER_ADDITION, {
                        action: 'USER_ADDITION',
                        data: {
                            mobile: value.mobile,
                            groupId: value.groupId
                        },
                        reason:
                            addition.data.participants[0].code == '408'
                                ? 'Could not Add the user as they left recently'
                                : 'Users privacy is enabled, please ask to switch to everyone in settings'
                    });

                    continue;
                }
                let subscriptionPlan = value.planId
                    ? await GroupPlanRepository.findPlanById(value.planId)
                    : {};

                let expiryDate = null;
                let expiryTimestamp = null;
                if (
                    value.status !== 'migrating' &&
                    subscriptionPlan['selectedPeriod'] !== 'Lifetime'
                ) {
                    const days =
                        subscriptionPlan['selectedPeriod'] == 'Custom Period'
                            ? Common.CUSTOM_SUBSCRIPTION_MAPPING[
                                  subscriptionPlan['customType']
                              ] * subscriptionPlan['customValue']
                            : Common.SUBSCRIPTION_MAPPING[
                                  `${subscriptionPlan['selectedPeriod']}`
                              ];
                    console.log('DAYS', days);

                    expiryDate = moment()
                        .add(days, 'days')
                        .format('YYYY-MM-DD');
                    expiryTimestamp = moment()
                        .add(days, 'days')
                        .format('YYYY-MM-DD HH:mm:ss');
                }

                freshchatService.sendWAuserAdditionFreshchatServiceRequest(
                    value.channelName,
                    value.type.slice(8),
                    value.mobile,
                    value.groupId
                );
                let updateData = {
                    inviteLink: '',
                    joinedBy: value.mobile,
                    status: 'success',
                    isActive: 1,
                    joinedDate: new Date()
                };
                if (expiryDate) {
                    updateData['expiryDate'] = expiryDate;
                    updateData['expiryTimestamp'] = expiryTimestamp;
                }
                await memberGroupMap.updateGroupMemberdata(
                    {
                        groupId: value.groupId,
                        memberId: value.memberId
                    },
                    updateData
                );

                // TODO: COMMUNICATION
                const randInt = randomIntFromInterval(13, 23);

                await Telegram.sleep(randInt * 1000);
            }

            return true;
        } catch (error) {
            console.log(error);
        }
    }
}

export default new MemberService();
