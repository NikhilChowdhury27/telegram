const { ResponseBuilder } = require('base-packages');
import GroupDetails from '../../../../models/GroupDetail';
import CommonService from '../../../../app/utils/common.service';
import GroupSubscriptionPlans from '../../../../models/GroupSubscriptionPlan';
import {
    BAD_CLIENT_REQUEST_400,
    ERROR_400,
    GROUP_CREATE_PENDING,
    GROUP_CREATE_SUCCESS,
    SUCCESSFULLY_UPDATED,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';
import GroupDetailsRepository from '../../../repository/group.repository';
import MemberGroupMapRepository from '../../../repository/member.group.map';
import Group from '../../../utils/group';
import paymentRepository from '../../../repository/payment.repository';
import userRepository from '../../../repository/user.repository';
import { IGroup, IPricing } from '../group.interface';
import GroupBotMap from '../../../../models/groupBotMap';
import GroupBotRepository from '../../../repository/group.bot.map.repository';
import RedisManager from '../../../../config/conf/RedisCache';
import { sequelize } from '../../../../sequelize';
import PaymentTable from '../../../../models/PaymentTable';
import User from '../../../../models/User';
import groupService from '../services/group';
import couponService from '../../coupons/services/coupon.service';
// import PubSubService from '../../../consumers/gcp.pubsub.consumer';
// import Coupons from '../../../../models/Coupon';
import { sign, SignOptions } from 'jsonwebtoken';
import * as moment from 'moment';
import MemberGroupMap from '../../../../models/MemberGroupMap';
import receiptDetailsRepository from '../../../repository/receipt.details.repository';
import Common from '../../../../config/constants/common';
import { getSignedUrl } from '../../../utils/gcloud/bucket.upload';
import { Op } from 'sequelize';
import whatsappConfig from '../../../../app/utils/whatsapp/whatsapp.config';
import CourseGroupMapping from '../../../../models/Course_group_mapping';
import phoneIdRepository from '../../../../app/repository/phone.id.repository';
// import memberGroupMap from '../../../repository/member.group.map';
// import groupSubscriptionPlan from 'src/app/repository/group.subscription.plan';
import OTP from '../../../utils/otp/otp';
import GroupCoAdminMapping from '../../../../models/Group_CoAdmin_details';
import telegram from '../../../../app/utils/telegram/telegram.common';
import GroupBotMapRepository from '../../../repository/group.bot.map.repository';
import FreshchatService from '../../../utils/freshchat/freshchat.service';
import { sendNotificationToGoogleChat } from '../../../../app/utils/alert.utils';
import {
    REMOVAL_CHAT_URL,
    waCommunityThreshold,
    waGroupThreshold,
    WHATSAPP_MANAGEMENT_URL
} from '../../../../config/constant';
import { randomIntFromInterval } from '../../../../app/utils/api.utils';
import RazorpayLinksMapping from '../../../../models/razorpay_links_mapping';
import razorpayService from '../../orders/services/razorpay.service';
import BankDetail from '../../../../models/BankDetail';
import PhoneId from '../../../../models/PhoneId';
import GroupPhoneMap from '../../../../models/GroupPhoneMap';
import freshchatService from '../../../utils/freshchat/freshchat.service';
import CommunicationLogs from '../../../../models/CommunicationLogs';
import CreatorInfo from '../../../../models/CreatorInfo';

class GroupServiceV2 extends CommonService {
    async migrateGroupPlans(data: any) {
        try {
            console.log(data);
            const groups = await GroupDetails.findAll({
                where: {
                    status: 'success'
                },
                order: [['createdAt', 'DESC']],

                limit: Number(data.limit) || 10,
                offset: Number(data.offset) || 0
            });

            for (let group of groups) {
                const GroupPlans = [];
                const subscriptionPlans = JSON.parse(group.subscriptionPlan);
                if (!subscriptionPlans.length) {
                    continue;
                }

                subscriptionPlans.forEach((plan) =>
                    GroupPlans.push({
                        groupId: group.id,
                        price: plan.price,
                        selectedPeriod: plan.selectedPeriod,
                        discount: plan.discount,
                        selectedOffer: plan.selectedOffer,
                        customType: plan.customType,
                        customValue: plan.customValue,
                        isCustom: plan.selectedPeriod === 'Custom Period',
                        periodTitle: plan.periodTitle
                    })
                );

                await Promise.allSettled(
                    GroupPlans.map((plan) => {
                        const GroupFilter = {
                            groupId: plan.groupId,
                            selectedPeriod: plan.selectedPeriod
                        };
                        if (plan.periodTitle) {
                            GroupFilter['periodTitle'] = plan.periodTitle;
                        }
                        return GroupSubscriptionPlans.findOrCreate({
                            where: GroupFilter,
                            defaults: {
                                groupId: plan.groupId,
                                price: plan.price,
                                selectedPeriod: plan.selectedPeriod,
                                discount: plan.discount,
                                selectedOffer: plan.selectedOffer,
                                customType: plan.customType,
                                customValue: plan.customValue,
                                isCustom:
                                    plan.selectedPeriod === 'Custom Period'
                                        ? 1
                                        : 0,
                                periodTitle: plan.periodTitle
                            },
                            logging: true
                        });
                    })
                );
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    async getGroupDetails(data: any) {
        try {
            let groupDetails: any = await GroupDetailsRepository.findGroupById(
                data.groupId
            );
            if (!groupDetails) {
                return new ResponseBuilder(400, {}, ERROR_400);
            }
            const plans = await GroupSubscriptionPlans.findAll({
                where: {
                    groupId: data.groupId,
                    isDeleted: false
                },
                raw: true
            });
            // get receipt status

            const [invoiceStatus, adminCount] = await Promise.all([
                receiptDetailsRepository.getDetail({
                    userId: groupDetails.createdBy
                }),
                GroupCoAdminMapping.count({
                    where: {
                        groupId: groupDetails.id
                    }
                })
            ]);

            groupDetails.subscriptionPlan = plans;
            // console.log(groupDetails);
            if (groupDetails.createdBy === data?.user?.id) {
                const activeCounts =
                    await MemberGroupMapRepository.membersCount(data.groupId);
                // console.log('activeCounts', activeCounts);
                groupDetails.members = activeCounts;
            }
            groupDetails.paymentLink = `${process.env.PAYMENT_DOMAIN}/g/${groupDetails.id}`;
            let channel = 'telegram';
            if (
                groupDetails.type == 'whatsappGroup' ||
                groupDetails.type == 'whatsappCommunity'
            ) {
                channel = 'whatsapp';
            }
            groupDetails.shareLinks = await Group.links(
                groupDetails.id,
                groupDetails.groupName,
                groupDetails.about,
                null,
                channel
            );

            groupDetails.inviteLink = groupDetails.inviteLink
                ? groupDetails.inviteLink.replace('t.me', 'telegram.me')
                : null;

            // TODO: switch to active member

            const [memberCount, activeMemberCount, totalRevenue] =
                await Promise.all([
                    paymentRepository.getTotalPurchases(groupDetails.id),

                    MemberGroupMap.count({
                        where: {
                            groupId: groupDetails.id,
                            memberStatus: 'renewed'
                        }
                    }),
                    PaymentTable.findAll({
                        attributes: [
                            [
                                sequelize.fn(
                                    'sum',
                                    sequelize.where(
                                        sequelize.col('amount'),
                                        '-',
                                        sequelize.col('fankonnectCommission')
                                    )
                                ),
                                'totalIncome'
                            ]
                        ],
                        where: {
                            groupId: groupDetails.id,
                            migrated: null,
                            [Op.or]: [
                                { status: 'Success' },
                                { paymentStatus: 'success' }
                            ]
                        }
                    })
                ]);
            groupDetails.memberCount = memberCount;
            groupDetails.totalRevenue =
                totalRevenue.length &&
                totalRevenue[0]['dataValues']['totalIncome']
                    ? Number(
                          totalRevenue[0]['dataValues']['totalIncome'].toFixed(
                              2
                          )
                      )
                    : 0;
            // console.log(groupDetails);

            let usageLimit;
            let threshold;
            if (
                groupDetails.type == 'telegramChannel' ||
                groupDetails.type == 'telegramExisting'
            ) {
                usageLimit = false;
            } else {
                threshold =
                    groupDetails.type == 'whatsappGroup'
                        ? waGroupThreshold
                        : waCommunityThreshold;
                usageLimit = activeMemberCount >= threshold;
            }
            return new ResponseBuilder(
                200,
                {
                    ...groupDetails,
                    usageLimit,
                    invoiceEnabled: invoiceStatus
                        ? invoiceStatus.invoiceEnabled
                        : 0,
                    adminCount
                },
                SUCCESS_200
            );
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, error, ERROR_400);
        }
    }

    async add(payload: any, userId: number) {
        // if (!payload.pricing.accessPrice) {
        //     payload.pricing.accessPrice = null;
        // }
        try {
            const userObj = await userRepository.findOneById(userId);
            if (!userObj) {
                return new ResponseBuilder(400, {}, ERROR_400);
            }
            payload.session = userObj.session;
            payload.userObj = userObj;
            // if (!userObj.telegramUserId) {
            //     const telegramUserRes: any = await Telegram.checkAndUpdateUser(
            //         userObj
            //     );

            //     if (!telegramUserRes && !telegramUserRes.id) {
            //         return {
            //             statusCode: 400,
            //             message: 'Telegram User Not Found',
            //             data: {}
            //         };
            //     }
            //     payload.userObj.telegramUserId = telegramUserRes.id;
            //     payload.userObj.telegramAccessHash = telegramUserRes.accessHash;
            // }
            // channelId: resp.chats[0].id,
            // channelHash: resp.chats[0].accessHash
            // console.log('PAY-1', payload);

            const pricing = payload.pricing.map((period) => {
                if (period.selectedPeriod == 'Custom Period') {
                    period.isCustom = true;
                    if (
                        period.customType == 'Months' &&
                        period.customValue == 1
                    ) {
                        period['periodTitle'] = 'Monthly';
                    } else if (
                        period.customType == 'Days' &&
                        period.customValue == 7
                    ) {
                        period['periodTitle'] = 'Weekly';
                    } else {
                        period[
                            'periodTitle'
                        ] = `${period.customValue} ${period.customType}`;
                    }
                }
                return period;
            });

            let group: IGroup = {
                groupName: payload.name,
                about: payload.about,
                subscriptionPlan: JSON.stringify(pricing),
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                channelId: 0,
                channelHash: '',
                status: 'pending',
                category: payload.category,
                logoUrl: payload.logoUrl,
                conditionalApproval: payload.conditionalApproval ? 1 : 0,
                formlink: payload.formLink || null
            };
            if (payload.type) {
                group.type = payload.type;
            }

            console.log('group creation payload', group);

            //
            // whatsapp group

            //
            if (payload.type && payload.type == 'telegramExisting') {
                const existingChannel = await GroupDetailsRepository.findGroup({
                    channelId: payload.channelId
                });
                if (!existingChannel) {
                    return new ResponseBuilder(
                        400,
                        { data: null },
                        BAD_CLIENT_REQUEST_400
                    );
                }
                GroupDetailsRepository.updateGroupByFiter(
                    { channelId: payload.channelId },
                    {
                        createdBy: userObj.id,
                        subscriptionPlan: group.subscriptionPlan,
                        groupName: group.groupName,
                        about: group.about,
                        category: group.category,
                        status: 'success',
                        type: payload.type,
                        logoUrl: group.logoUrl,
                        conditionalApproval: group.conditionalApproval,
                        formLink: group.formlink
                    }
                );

                const createManyPayload = pricing.map((price) => {
                    return {
                        ...price,
                        groupId: existingChannel.id
                    };
                });

                GroupSubscriptionPlans.bulkCreate(createManyPayload);

                // TODO: communication
                Group.sendSms(
                    [userObj.mobile],
                    userObj.id,
                    undefined,
                    existingChannel.id,
                    {
                        adminName: userObj.name,
                        channelName: existingChannel.groupName
                    },
                    process.env.COMM_ACCESS_SMS_ADMIN_RIGHTS,
                    'adminRights'
                );
                return new ResponseBuilder(
                    200,
                    existingChannel,

                    GROUP_CREATE_SUCCESS
                );
            }
            // const createdResult: any = await GroupDetailsRepository.addGroup(
            //     group
            // );

            // pre created groups fetch
            let createdResultPre: any = await GroupDetailsRepository.findGroup({
                status: 'ready',
                type: payload.type || 'telegramChannel'
            });
            console.log('pre group', createdResultPre);

            //

            console.log('group', group);
            const updatedInfo =
                createdResultPre &&
                (await GroupDetailsRepository.updateGroupByFiter(
                    { id: createdResultPre.id },
                    {
                        createdBy: userObj.id,
                        subscriptionPlan: group.subscriptionPlan,
                        groupName: group.groupName,
                        about: group.about,
                        category: group.category,
                        status: 'pending',
                        conditionalApproval: group.conditionalApproval,
                        formLink: group.formlink,
                        logoUrl: group.logoUrl
                    }
                ));

            console.log('UPDATED_INFO', updatedInfo);
            const createdResult: any =
                createdResultPre ||
                (await GroupDetailsRepository.addGroup(group));
            console.log('createdResult', createdResult);
            createdResult.logoUrl = group.logoUrl || null;
            let botToken: GroupBotMap;

            await Promise.allSettled(
                pricing.map((price) =>
                    GroupSubscriptionPlans.create({
                        ...price,
                        groupId: createdResult.id
                    })
                )
            );
            if (
                createdResultPre &&
                createdResultPre.type == 'telegramChannel'
            ) {
                botToken = await GroupBotRepository.findOne({
                    groupId: createdResultPre.id,
                    isActive: 1,
                    isPrimary: 1
                });
                let headersList = {
                    Accept: '*/*',

                    'Content-Type': 'application/json'
                };
                let bodyContent = {
                    title: group.groupName
                };

                // let bodyContentAbout = {
                //     description: ''
                // };

                let reqOptions = {
                    url: `https://api.telegram.org/bot${botToken.botToken.token}/setChatTitle?chat_id=-100${createdResultPre.channelId}`,
                    method: 'POST',
                    headers: headersList,
                    data: bodyContent
                };

                // let reqOptionsAbout = {
                //     url: `https://api.telegram.org/bot${botToken.botToken.token}/setChatDescription?chat_id=-100${createdResultPre.channelId}`,
                //     method: 'POST',
                //     headers: headersList,
                //     data: bodyContentAbout
                // };

                groupService.editTgChannel(reqOptions);
            }
            // createdResult = JSON.parse(JSON.stringify(createdResult));
            // createdResult.dataValues.shareLinks = await Group.links(
            //     createdResult.id,
            //     createdResult.groupName,
            //     createdResult.about
            // );
            const emailTemplateData = {
                userName: userObj.name,
                accountName: group.groupName,
                groupName: group.groupName,
                telegramChannelLink:
                    createdResult?.inviteLink &&
                    createdResult.inviteLink.replace('t.me', 'telegram.me'),
                adminName: userObj.name
            };

            console.log('created', createdResult);
            if (createdResult.inviteLink) {
                await Promise.all([
                    RedisManager.addToHashmap(createdResult.inviteLink, {
                        groupName: group.groupName,
                        name: userObj.name,
                        mobile: userObj.mobile,
                        groupId: createdResult.id,
                        userId: userObj.id,
                        type: 'group',
                        token: botToken ? botToken.botToken.token : null,
                        conditionalApproval: group.conditionalApproval
                    }),
                    Group.sendSms(
                        [userObj.mobile],
                        userObj.id,
                        undefined,
                        createdResult.id,
                        {
                            groupAdmin: userObj.name,
                            inviteLink: encodeURIComponent(
                                encodeURIComponent(createdResult.inviteLink)
                            ),
                            channelName: group.groupName
                        },
                        process.env.COMM_ACCESS_SMS_GROUP_CREATED,
                        'groupCreated'
                    ),
                    userObj.email &&
                        (await Group.sendEmail(
                            [userObj.email],
                            process.env.COMM_ACCESS_EMAIL_GROUP_CREATED,
                            Number(
                                process.env
                                    .COMM_ACCESS_EMAIL_GROUP_CREATED_TEMPLATE
                            ),
                            null,
                            // userObj.id,
                            // createdResult.id,
                            emailTemplateData
                        ))
                ]);
                RedisManager.expireKey(
                    createdResult.inviteLink,
                    7 * 24 * 60 * 60
                );
            }

            return new ResponseBuilder(
                200,
                createdResult,
                createdResultPre ? GROUP_CREATE_PENDING : GROUP_CREATE_SUCCESS
            );
        } catch (err) {
            console.log('err in group creation in db', err);
        }
    }

    async whatsappAdd(payload: any, userId: number) {
        // if (!payload.pricing.accessPrice) {
        //     payload.pricing.accessPrice = null;
        // }
        try {
            const userObj = await userRepository.findOneById(userId);
            if (!userObj) {
                return new ResponseBuilder(400, {}, ERROR_400);
            }
            payload.session = userObj.session;
            payload.userObj = userObj;

            const pricing = payload.pricing.map((period) => {
                if (period.selectedPeriod == 'Custom Period') {
                    period.isCustom = true;
                    if (
                        period.customType == 'Months' &&
                        period.customValue == 1
                    ) {
                        period['periodTitle'] = 'Monthly';
                    } else if (
                        period.customType == 'Days' &&
                        period.customValue == 7
                    ) {
                        period['periodTitle'] = 'Weekly';
                    } else {
                        period[
                            'periodTitle'
                        ] = `${period.customValue} ${period.customType}`;
                    }
                }
                return period;
            });

            let group: IGroup = {
                groupName: payload.name,
                about: payload.about,
                subscriptionPlan: JSON.stringify(pricing),
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                channelId: 0,
                channelHash: '',
                status: 'pending',
                category: payload.category,
                logoUrl: payload.logoUrl,
                conditionalApproval: payload.conditionalApproval ? 1 : 0,
                formlink: payload.formLink || null
            };

            // TODO://
            if (payload.type) {
                group.type = payload.type;
            }
            // TODO: put validation for whatsapp type

            console.log('group creation payload', group);

            const created = await GroupDetailsRepository.addGroup(group);

            console.log('group creation result', created);

            await Promise.allSettled(
                pricing.map((price) =>
                    GroupSubscriptionPlans.create({
                        ...price,
                        groupId: created.id
                    })
                )
            );
            let businessNumber1 = await phoneIdRepository.findPhone({});

            sendNotificationToGoogleChat(WHATSAPP_MANAGEMENT_URL, {
                action: 'WHATSAPP_CREATION',
                data: {
                    mobile: userObj.mobile,
                    groupId: created.id,
                    type: payload.type,
                    businessNumber: businessNumber1.phone,
                    groupName: created.groupName
                }
            });
            return new ResponseBuilder(
                200,
                {
                    ...created['dataValues'],
                    joinedBy: null
                },
                GROUP_CREATE_PENDING
            );

            //
            // whatsapp group

            // pre created groups fetch
            let createdResultPre: any = await GroupDetailsRepository.findGroup({
                status: 'ready',
                type: payload.type
            });
            console.log('pre group', createdResultPre);

            //

            console.log('group', group);

            let businessNumber;
            let ownerNumber;

            // community flow - found ready group and mapped with creator
            const updatedInfo =
                createdResultPre &&
                (await GroupDetailsRepository.updateGroupByFiter(
                    { id: createdResultPre.id },
                    {
                        createdBy: userObj.id,
                        subscriptionPlan: group.subscriptionPlan,
                        groupName: group.groupName,
                        about: group.about,
                        category: group.category,
                        status: 'pending',
                        conditionalApproval: group.conditionalApproval || null,
                        formLink: group.formlink || null,
                        logoUrl: group.logoUrl || null
                    }
                ));
            if (
                !createdResultPre &&
                payload.type &&
                payload.type == 'whatsappGroup'
            ) {
                // TOOD: DB CALL TO GET A BUSINESS NUMBER
                businessNumber = await phoneIdRepository.findPhone({});
                ownerNumber = await phoneIdRepository.findAnotherPhone(
                    businessNumber.id
                );
                let data = JSON.stringify({
                    name: group.groupName,
                    numbers: [userObj.mobile, businessNumber.phone]
                });
                const res = await whatsappConfig.createGroup(
                    data,
                    ownerNumber.phoneId
                );
                console.log('WHATSAPP CRAETE', res);
                // TODO: failed create handle
                if (res && res.success) {
                    const channelId: any = res.data.id.split('@')[0];
                    console.log('CHANNELID', channelId);
                    group.channelId = channelId;

                    group.type = payload.type;
                    const joined = res.data.participants.indexOf(
                        `${userObj.mobile}@c.us`
                    );

                    console.log('JOINED', joined, res.data.participants);
                    group.joinedBy =
                        joined >= 0 ? Number(userObj.mobile) : null;
                    let data = JSON.stringify({
                        conversation_id: `${channelId}@g.us`,
                        number: `${businessNumber.phone}@c.us`
                    });
                    whatsappConfig.promoteInGroup(data, ownerNumber.phoneId);
                }
            }

            console.log('UPDATED_INFO', updatedInfo);
            const createdResult: any =
                createdResultPre ||
                (await GroupDetailsRepository.addGroup(group));
            if (!createdResultPre) {
                const groupPhoneMap = [
                    {
                        phoneId: businessNumber.id,
                        groupId: createdResult.dataValues.id,
                        isPrimary: 0,
                        isActive: 1
                    },
                    {
                        phoneId: ownerNumber.id,
                        groupId: createdResult.dataValues.id,
                        isPrimary: 1,
                        isActive: 1
                    }
                ];

                phoneIdRepository.createGroupPhoneMap(groupPhoneMap);
            }
            console.log('createdResult', createdResult);
            createdResult.logoUrl = group.logoUrl || null;

            await Promise.allSettled(
                pricing.map((price) =>
                    GroupSubscriptionPlans.create({
                        ...price,
                        groupId: createdResult.id
                    })
                )
            );

            if (createdResult.type == 'whatsappCommunity') {
                // send group creation sms, email to creator with new template

                // add creator to community
                if (createdResult.channelId) {
                    // add user number to whastapp

                    const ownerNumber = await phoneIdRepository.findActivePhone(
                        createdResult.id
                    );

                    let data = JSON.stringify({
                        conversation_id: `${createdResult.channelId}@g.us`,
                        number: `${userObj.mobile}@c.us`
                    });

                    const res = await whatsappConfig.addToGroup(
                        data,
                        ownerNumber.phone.phoneId
                    );
                    console.log('whatsapp', res);
                    if (
                        res &&
                        res.success &&
                        res.data.participants[0].code == 200
                    ) {
                        GroupDetailsRepository.updateGroupByFiter(
                            { id: createdResult.id },
                            {
                                joinedBy: userObj.mobile
                            }
                        );
                        whatsappConfig.sendMessage(
                            {
                                to_number: '918145293934',
                                type: 'text',
                                message: `${userObj.mobile} has requested to be admin of the group - ${createdResultPre.groupName}. Please change the community name to ${group.groupName}`
                            },
                            ownerNumber.phone.phoneId
                        );
                        return new ResponseBuilder(
                            200,
                            {
                                ...createdResult.dataValues,
                                joinedBy: userObj.mobile,
                                status: 'pending'
                            },

                            GROUP_CREATE_SUCCESS
                        );
                    }
                    return new ResponseBuilder(
                        200,
                        {
                            ...createdResult.dataValues,
                            status: 'pending'
                        },

                        GROUP_CREATE_PENDING
                    );

                    // TODO: Response in pending state

                    // api call to add
                }

                // send alert to team to make admin
            }
            if (createdResult.type == 'whatsappGroup') {
                // send group creation sms, email to creator with new template

                // add creator to community
                if (createdResult.channelId) {
                    // 1. add user number to whastapp
                    // 2. promote user number to whastapp

                    // 1.
                    let data = JSON.stringify({
                        conversation_id: `${createdResult.channelId}@g.us`,
                        number: `${userObj.mobile}@c.us`
                    });

                    ownerNumber = !createdResultPre
                        ? ownerNumber
                        : (
                              await phoneIdRepository.findActivePhone(
                                  createdResult.id
                              )
                          ).phone;

                    const res = !createdResultPre
                        ? { success: true }
                        : await whatsappConfig.addToGroup(
                              data,
                              ownerNumber.phoneId
                          );
                    console.log('whatsapp', res);
                    const joined = !createdResultPre
                        ? Boolean(createdResult.joinedBy)
                        : res &&
                          res.success &&
                          res.data.participants[0].code == 200;

                    // 2.
                    if (joined) {
                        let data = JSON.stringify({
                            conversation_id: `${createdResult.channelId}@g.us`,
                            number: `${userObj.mobile}@c.us`
                        });

                        console.log('promote data', data);

                        const promoteRes = await whatsappConfig.promoteInGroup(
                            data,
                            ownerNumber.phoneId
                        );
                        console.log(promoteRes.success);
                        if (promoteRes && promoteRes.success) {
                            // return success
                            console.log('i am here');
                            GroupDetailsRepository.updateGroupByFiter(
                                { id: createdResult.id },
                                {
                                    status: 'success',
                                    joinedBy: userObj.mobile
                                }
                            );
                            return new ResponseBuilder(
                                200,
                                {
                                    ...createdResult.dataValues,
                                    status: 'success'
                                },
                                GROUP_CREATE_SUCCESS
                            );
                        }
                        // here creator is added to the group
                        createdResult.joinedBy &&
                            GroupDetailsRepository.updateGroupByFiter(
                                { id: createdResult.id },
                                {
                                    joinedBy: userObj.mobile
                                }
                            );

                        return new ResponseBuilder(
                            200,
                            {
                                ...createdResult.dataValues,
                                joinedBy: createdResult.joinedBy
                                    ? userObj.mobile
                                    : null
                            },
                            createdResultPre
                                ? GROUP_CREATE_PENDING
                                : GROUP_CREATE_SUCCESS
                        );

                        // else return pending
                    }
                } else {
                    // TODO:
                    return new ResponseBuilder(
                        200,
                        createdResult.dataValues,
                        GROUP_CREATE_PENDING
                    );
                }

                // if promote success, return success response
            }

            return new ResponseBuilder(
                200,
                createdResult,
                createdResultPre ? GROUP_CREATE_PENDING : GROUP_CREATE_SUCCESS
            );
        } catch (err) {
            console.log('err in group creation in db', err);
        }
    }

    async whatsappMap(payload: any, userId: number) {
        const groupDetails = await GroupDetails.findByPk(payload.groupId);
        if (
            !groupDetails ||
            groupDetails.status == 'success' ||
            groupDetails.joinedBy
        ) {
            {
                return new ResponseBuilder(
                    400,
                    { data: null },
                    'WRONG GROUP ID PASSED'
                );
            }
        }

        const getPrimaryPhoneId = await PhoneId.findOne({
            where: {
                phone: payload.primaryPhone
            }
        });

        const getSecondaryPhoneId = await PhoneId.findOne({
            where: {
                phone: payload.secondaryPhone
            }
        });

        if (!getPrimaryPhoneId || !getSecondaryPhoneId) {
            {
                return new ResponseBuilder(
                    400,
                    {
                        data: {
                            groupId: payload.groupId
                        }
                    },
                    'WRONG PHONE PASSED'
                );
            }
        }

        const groupPhoneMapPaylaod = [
            {
                groupId: payload.groupId,
                phoneId: getPrimaryPhoneId.id,
                isPrimary: 1
            },
            {
                groupId: payload.groupId,
                phoneId: getSecondaryPhoneId.id,
                isPrimary: 0
            }
        ];

        const createMapping = await GroupPhoneMap.bulkCreate(
            groupPhoneMapPaylaod
        );
        if (createMapping && createMapping.length) {
            const updated = await GroupDetails.update(
                {
                    channelId: payload.channelId,
                    joinedBy: payload.joinedBy
                },
                {
                    where: {
                        id: groupDetails.id
                    }
                }
            );
            console.log(updated);
            if (updated[0] == 1) {
                return new ResponseBuilder(
                    200,
                    { message: 'success' },
                    'GROUP WILL BE UPDATED WITHIN 2 MINUTES'
                );
            }
        } else {
            return new ResponseBuilder(
                400,
                { data: null },
                'NOT SUCCESS, PLEASE CHECK WITH BE TEAM'
            );
        }
    }

    async getChannelBreakdown(data: any) {
        try {
            const filter = {
                groupId: data.groupId,
                [Op.or]: [{ status: 'Success' }, { paymentStatus: 'success' }]
            };
            if (data.startDate && data.endDate) {
                filter['createdAt'] = {
                    $between: [data.startDate, data.endDate]
                };
            }
            const [paymentBreakdown, channelDetails] = await Promise.all([
                PaymentTable.findAll({
                    where: filter,
                    order: [['createdAt', 'desc']],
                    include: [
                        {
                            model: User,
                            attributes: ['name']
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
                        'sellerId',
                        'fankonnectCommission',
                        'currentPlan',
                        'migrated',
                        'orderId',
                        'renewed',
                        'planId',
                        'couponName',
                        'couponDiscount'
                    ],
                    limit: Number(data.limit) || 10,
                    offset: Number(data.offset) || 0
                }),
                PaymentTable.findAll({
                    where: filter,
                    attributes: [
                        [
                            sequelize.fn(
                                'count',
                                sequelize.col('PaymentTable.id')
                            ),
                            'totalPurchases'
                        ],
                        [
                            sequelize.fn(
                                'sum',
                                sequelize.col('PaymentTable.amount')
                            ),
                            'totalAmount'
                        ]
                    ],
                    group: ['PaymentTable.groupId']
                })
            ]);
            console.log(paymentBreakdown);
            return new ResponseBuilder(
                200,
                {
                    paymentBreakdown,
                    totalPurchases: channelDetails.length
                        ? channelDetails[0]['dataValues']['totalPurchases']
                        : 0,
                    totalAmount: channelDetails.length
                        ? Number(
                              channelDetails[0]['dataValues'][
                                  'totalAmount'
                              ].toFixed(2)
                          )
                        : 0
                },
                SUCCESS_200
            );
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, error, BAD_CLIENT_REQUEST_400);
        }
    }

    async getChannelBreakdownV2(data: any) {
        try {
            const filter = {
                groupId: data.groupId,
                [Op.or]: [{ status: 'Success' }, { paymentStatus: 'success' }]
            };
            if (data.startDate && data.endDate) {
                filter['createdAt'] = {
                    $between: [data.startDate, data.endDate]
                };
            }
            const [paymentBreakdown, channelDetails] = await Promise.all([
                PaymentTable.findAll({
                    where: filter,
                    order: [['createdAt', 'desc']],
                    include: [
                        {
                            model: User,
                            attributes: ['name', 'mobile']
                        },
                        {
                            model: GroupSubscriptionPlans
                        },
                        // {
                        //     model: MemberGroupMap,
                        //     attributes: ['joinedBy']
                        // },
                        {
                            model: GroupDetails,
                            attributes: ['logoUrl']
                        }
                    ],
                    attributes: [
                        'createdAt',
                        'amount',
                        'buyerId',
                        'sellerId',
                        'fankonnectCommission',
                        'currentPlan',
                        'migrated',
                        'orderId',
                        'renewed',
                        'planId',
                        'couponName',
                        'couponDiscount',
                        'groupId'
                    ],
                    limit: Number(data.limit) || 10,
                    offset: Number(data.offset) || 0
                }),
                PaymentTable.findAll({
                    where: { ...filter, migrated: null },
                    attributes: [
                        [
                            sequelize.fn(
                                'count',
                                sequelize.col('PaymentTable.id')
                            ),
                            'totalPurchases'
                        ],
                        [
                            sequelize.fn(
                                'sum',
                                sequelize.where(
                                    sequelize.col('PaymentTable.amount'),
                                    '-',
                                    sequelize.col(
                                        'PaymentTable.fankonnectCommission'
                                    )
                                )
                            ),
                            'totalAmount'
                        ]
                    ],
                    group: ['PaymentTable.groupId']
                })
            ]);

            const finalPaymentBreakdown = [];

            for (let payment of paymentBreakdown) {
                console.log('checking', payment);
                const memberData = await MemberGroupMap.findOne({
                    where: {
                        memberId: payment['dataValues'].buyerId,
                        groupId: payment['dataValues'].groupId
                    },
                    raw: true,
                    attributes: ['joinedBy', 'isLeft']
                });

                const currentPlan =
                    payment.currentPlan && JSON.parse(payment.currentPlan);
                finalPaymentBreakdown.push({
                    ...payment['dataValues'],
                    amount:
                        payment['dataValues'].amount -
                        payment['dataValues'].fankonnectCommission,
                    joinedBy: memberData ? memberData.joinedBy : null,
                    isLeft: memberData ? memberData.isLeft : 0,
                    ...(currentPlan && { orignalPrice: currentPlan.price }),
                    ...(currentPlan && { planDiscount: currentPlan.discount })
                });
            }

            return new ResponseBuilder(
                200,
                {
                    paymentBreakdown: finalPaymentBreakdown,
                    totalPurchases: channelDetails.length
                        ? channelDetails[0]['dataValues']['totalPurchases']
                        : 0,
                    totalAmount:
                        channelDetails.length &&
                        channelDetails[0]['dataValues']['totalAmount']
                            ? Number(
                                  channelDetails[0]['dataValues'][
                                      'totalAmount'
                                  ].toFixed(2)
                              )
                            : 0
                },
                SUCCESS_200
            );
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, error, BAD_CLIENT_REQUEST_400);
        }
    }

    async updateGroup(
        groupId: number,
        userId: number,
        data: IPricing[],
        title?: string,
        logoUrl?: string,
        description?: string,
        conditionalApproval?: number,
        formLink?: string
    ) {
        const pricing = data.map((period) => {
            if (period.selectedPeriod == 'Custom Period') {
                if (period.customType == 'Months' && period.customValue == 1) {
                    period['periodTitle'] = 'Monthly';
                } else if (
                    period.customType == 'Days' &&
                    period.customValue == 7
                ) {
                    period['periodTitle'] = 'Weekly';
                } else {
                    period[
                        'periodTitle'
                    ] = `${period.customValue} ${period.customType}`;
                }
            }
            return period;
        });

        // const coupons = await Coupons.findAll({
        //     where: {
        //         groupId: groupId,
        //         isActive: true
        //     },
        //     attributes: ['id']
        // });
        const pricingPlansId = pricing.map((price) => price.id);
        const groupPlans = await GroupSubscriptionPlans.findAll({
            where: {
                groupId,
                isDeleted: false
            }
        });
        const deletedPlans = groupPlans.filter(
            (item) => !pricingPlansId.includes(item.id)
        );

        await Promise.allSettled(
            deletedPlans.map((plan) =>
                GroupSubscriptionPlans.update(
                    {
                        isDeleted: 1
                    },
                    {
                        where: {
                            id: plan.id
                        }
                    }
                )
            )
        );
        for (let groupPlan of pricing) {
            if (groupPlan.id) {
                await GroupSubscriptionPlans.update(
                    {
                        ...groupPlan
                    },
                    {
                        where: {
                            id: groupPlan.id
                        }
                    }
                );
            } else {
                await GroupSubscriptionPlans.create({
                    ...groupPlan,
                    groupId: groupId
                });
            }
        }

        const result = await GroupDetailsRepository.updateGroup(
            groupId,
            userId,
            pricing,
            title,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            logoUrl,
            description,
            conditionalApproval,
            formLink
        );
        return new ResponseBuilder(200, result, SUCCESSFULLY_UPDATED);

        // if (coupons.length) {
        //     PubSubService.sendMessage(
        //         {
        //             groupId,
        //             coupons,
        //             userId,
        //             pricing
        //         },
        //         process.env.FK_COMMON_TOPIC,
        //         {
        //             type: 'editGroup'
        //         }
        //     );
        //     return new ResponseBuilder(
        //         200,
        //         {
        //             success: true,
        //             message: 'Edit in progress'
        //         },
        //         SUCCESSFULLY_UPDATED
        //     );
        // }

        // if (title) {
        //     const groupDetails = await GroupDetailsRepository.findGroupById(
        //         groupId
        //     );
        //     if (!groupDetails) {
        //         throw new Error(INVALID_GROUP);
        //     }
        //     let channelId = groupDetails.channelId;
        //     let channelHash = groupDetails.channelHash;
        //     const resp: any = await Telegram.editChannetTitle(
        //         title,
        //         channelId,
        //         channelHash
        //     );
        //     if (resp instanceof Error) {
        //         return new ResponseBuilder(500, {}, resp.message);
        //     }
        //     console.log('channel title updated ', resp);
        // }
        // return new ResponseBuilder(200, {}, SUCCESSFULLY_UPDATED);
    }

    async updateGroupWithCoupons(payload: any) {
        try {
            const { groupId, coupons, userId, pricing } = payload;
            const subscriptionPlans = await GroupSubscriptionPlans.findAll({
                where: {
                    groupId: groupId
                }
            });
            const filteredPlans = pricing.filter((plan) => plan.isDeleted == 0);
            const updatedPlans = [];
            const deletedPlans = [];

            for (let plan of subscriptionPlans) {
                if (plan['isEdited']) {
                    updatedPlans.push(plan);
                } else if (plan['isDeleted']) {
                    deletedPlans.push(plan);
                }
            }
            await Promise.all(
                updatedPlans.map((plan) =>
                    GroupSubscriptionPlans.update(
                        {
                            selectedPeriod: plan.selectedPeriod,
                            selectedOffer: plan.selectedPeriod,
                            price: plan.price,
                            discount: plan.discount,
                            isCustom:
                                plan.selectedPeriod === 'Custom Period' ? 1 : 0,
                            periodTitle: plan.periodTitle,
                            customType: plan.customType,
                            customValue: plan.customValue
                        },
                        {
                            where: {
                                id: plan.id
                            }
                        }
                    )
                )
            );

            await Promise.all([
                deletedPlans.map((plan) =>
                    GroupSubscriptionPlans.update(
                        {
                            isDeleted: 1
                        },
                        {
                            where: {
                                id: plan.id
                            }
                        }
                    )
                )
            ]);
            await Promise.allSettled(
                coupons.map((coupon) =>
                    couponService.checkCouponForActivation(coupon.id, pricing)
                )
            );
            const result = await GroupDetailsRepository.updateGroup(
                groupId,
                userId,
                filteredPlans
            );
            return new ResponseBuilder(200, result, SUCCESSFULLY_UPDATED);
        } catch (error) {
            return new ResponseBuilder(400, {}, ERROR_400);
        }
    }

    async getPreAuthGroupData(data: any) {
        try {
            console.log(data);
            const [encryptedMember, encryptedGroup] = await data.id.split(
                'fnkp'
            );
            const memberId = await this.getDecryptedMember(encryptedMember);

            const groupId = await this.getDecryptedGroup(encryptedGroup);

            const [userData, group, plans] = await Promise.all([
                userRepository.findUserDetails(memberId, [
                    'id',
                    'name',
                    'email',
                    'mobile'
                ]),
                GroupDetails.findOne({
                    where: {
                        id: groupId
                    },
                    attributes: [
                        'id',
                        'groupName',
                        'about',
                        'subscriptionPlan',
                        'category',
                        'logoUrl',
                        'createdBy',
                        'type'
                    ],
                    raw: true
                }),
                GroupSubscriptionPlans.findAll({
                    where: {
                        groupId,
                        isDeleted: false
                    },
                    raw: true
                })
            ]);

            const invoiceStatus = await receiptDetailsRepository.getDetail({
                userId: group.createdBy
            });

            if (!userData || !group) {
                return new ResponseBuilder(400, {}, 'Incorrect Url');
            }

            const [memberdata, memberCount] = await Promise.all([
                MemberGroupMap.findOne({
                    where: {
                        groupId,
                        memberId
                    },
                    attributes: [
                        'id',
                        'currentPlan',
                        'expiryDate',
                        'memberStatus',
                        'joinedDate',
                        'currentPlan',
                        'planId'
                    ],
                    raw: true
                }),
                MemberGroupMap.count({
                    where: {
                        groupId,
                        memberStatus: 'renewed'
                    }
                })
            ]);

            const memberPlan =
                memberdata.planId &&
                (await GroupSubscriptionPlans.findOne({
                    where: {
                        id: memberdata.planId
                    },
                    raw: true
                }));

            const differenceInDays = moment(memberdata['expiryDate']).diff(
                moment().format('YYYY-MM-DD'),
                'days'
            );

            const currentPlan = differenceInDays <= 0 ? {} : memberPlan;
            const actualCurrentPlan =
                currentPlan &&
                (currentPlan['selectedOffer'] == 'Free Trial'
                    ? []
                    : plans.filter((plan) => plan.id === currentPlan['id']));
            // let planList;

            const planList = currentPlan
                ? plans.filter((plan) => plan.id !== currentPlan['id'])
                : plans;

            // filter free plan of user consumed

            let subscriptionPlansToDisplay = [];
            for (const plan of planList) {
                if (plan['selectedOffer'] == 'Free Trial') {
                    console.log('free-1');
                    const existingPendingOrder =
                        await paymentRepository.getPaymentByFilter(
                            {
                                groupId,
                                buyerId: memberId
                            },
                            1 // freemium
                        );

                    if (existingPendingOrder) {
                        continue;
                    }
                }
                subscriptionPlansToDisplay.push(plan);
            }

            // console.log(subscriptionPlansToDisplay, 'sub-3');
            group.subscriptionPlan = JSON.stringify(subscriptionPlansToDisplay);

            const payload = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile
            };
            const token = sign(payload, process.env.TOKEN_SECRET, <SignOptions>{
                expiresIn: process.env.TOKEN_EXPIRY_DURATION,
                algorithm: process.env.ACCESS_TOKEN_ALGO
            });

            // logic for limit participants
            let usageLimit;
            let threshold;
            if (
                group.type == 'telegramChannel' ||
                group.type == 'telegramExisting'
            ) {
                usageLimit = false;
            } else {
                threshold =
                    group.type == 'whatsappGroup'
                        ? waGroupThreshold
                        : waCommunityThreshold;
                usageLimit =
                    memberdata.memberStatus == 'renewed'
                        ? false
                        : memberCount >= threshold;
            }

            return new ResponseBuilder(
                200,
                {
                    user: userData,
                    group: group,
                    usageLimit,
                    memberdata: {
                        ...memberdata,
                        differenceInDays:
                            differenceInDays > 0 ? differenceInDays : 0,
                        currentPlan:
                            actualCurrentPlan &&
                            actualCurrentPlan.length &&
                            differenceInDays > 0
                                ? JSON.stringify(actualCurrentPlan[0])
                                : ''
                    },
                    token,
                    invoiceEnabled: invoiceStatus
                        ? invoiceStatus.invoiceEnabled
                        : 0
                },
                SUCCESS_200
            );
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, {}, 'Something went wrong');
        }
    }

    async uploadImage(
        fileExtension: string,
        destination: string,
        userId: number
    ) {
        try {
            const extension = Common.EXTENSION_MAPPING[fileExtension];

            const BucketName =
                process.env.ENVIRONMENT == 'production'
                    ? 'fankonnect_public'
                    : process.env.FANKONNECT_GENERAL_BUCKET;
            const destFileName =
                destination == 'group'
                    ? 'group' +
                      new Date().getTime() +
                      '-' +
                      `${userId}` +
                      extension
                    : 'gst/' +
                      new Date().getTime() +
                      '-' +
                      `gst-${userId}` +
                      extension;
            console.log('BucketName', BucketName, destFileName);
            const url = await getSignedUrl(
                destFileName,
                BucketName,
                fileExtension
            );
            return new ResponseBuilder(200, url, SUCCESSFULLY_UPDATED);
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, {}, ERROR_400);
        }
    }

    async getChannelDetails(data: any) {
        try {
            let groupDetails: any = await GroupDetailsRepository.findGroup({
                channelId: data.channelId
            });

            if (!groupDetails) {
                return new ResponseBuilder(400, {}, ERROR_400);
            }

            if (groupDetails.createdBy == data.user.id) {
                return new ResponseBuilder(
                    400,
                    { message: 'Channel is already linked' },
                    'Channel is already linked'
                );
            }

            return new ResponseBuilder(
                200,
                { groupName: groupDetails.groupName },
                SUCCESS_200
            );
        } catch (error) {
            console.log(error);
            return new ResponseBuilder(400, error, ERROR_400);
        }
    }

    async classplusWebhookUsesAddition(payload: any) {
        try {
            const courseData = await CourseGroupMapping.findAll({
                where: {
                    courseId: payload.courseId,
                    orgId: payload.orgId,
                    isActive: 1
                },
                raw: true
            });
            if (!courseData.length) {
                return new ResponseBuilder(
                    400,
                    { isCourseMapped: false },
                    ERROR_400
                );
            }

            for (let i = 0; i < courseData.length; i++) {
                const groupId = courseData[i].groupId;
                const group = await GroupDetails.findOne({
                    where: {
                        id: groupId
                    },
                    raw: true
                });
                if (!group) {
                    continue;
                }
                const joiningDate = moment(payload.joiningDate);
                const year = payload.expiryDate
                    ? moment(payload.expiryDate).year()
                    : moment().year();
                const duration =
                    courseData[i].duration === 'days' ? 'days' : 'months';
                const FankonnectExpiry =
                    courseData[i].value && courseData[i].duration
                        ? moment().add(courseData[i].value, duration)
                        : null;
                const expiryDate =
                    FankonnectExpiry ||
                    (payload.expiryDate && year < 2025
                        ? moment(payload.expiryDate)
                        : null);

                const userObj = await userRepository.findOrCreateByNumber(
                    payload
                );
                console.log('userObj', userObj.user.id);

                const payment = await PaymentTable.create({
                    buyerId: userObj.user.id,
                    sellerId: group.createdBy,
                    migrated: 1,
                    groupId: group.id,
                    amount: Number(payload.amountPaid),
                    orderType: 'group',
                    currentPlan: '',
                    orderId: '',
                    status: 'success'
                });

                const member = await MemberGroupMap.findOne({
                    where: {
                        memberId: payment.buyerId,
                        groupId: group.id
                    },
                    raw: true
                });
                const expiryTimestamp: any = expiryDate
                    ? expiryDate.format('YYYY-MM-DD HH:mm:ss')
                    : null;
                const memberExpiryDate: any = expiryDate
                    ? expiryDate.format('YYYY-MM-DD')
                    : null;
                const joinedDate: any = joiningDate.format(
                    'YYYY-MM-DD HH:mm:ss'
                );
                if (!member) {
                    await MemberGroupMap.create({
                        memberId: userObj.user.id,
                        groupId: group.id,
                        paymentId: payment.id,
                        expiryTimestamp: expiryTimestamp,
                        currentPlan: '',
                        isAdded: 1,
                        status: 'migrating',
                        expiryDate: memberExpiryDate,
                        groupName: group.groupName,
                        joinedDate: joinedDate
                    });
                } else if (member) {
                    groupService.extendMembersExpiry({
                        membersData: [
                            {
                                mobile: payload.mobile,
                                expiryDate: payload.expiryDate
                            }
                        ],
                        groupId: group.id
                    });
                }
            }

            await User.update(
                {
                    whatsappStatus: 1
                },
                {
                    where: {
                        mobile: payload.mobile
                    }
                }
            );
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (error) {
            console.log(error);
        }
    }

    async CheckAndCreateCoAdmin(payload: any) {
        try {
            const { mobile, otp, sessionId, groupId, name = '' } = payload;
            let coAdminInviteLink = '';
            const isValidOTP = OTP.validateOTP(otp, mobile, sessionId);
            if (!isValidOTP) {
                throw new Error('Invalid OTP');
            }

            const [group, user, coAdmin, botToken] = await Promise.all([
                GroupDetails.findOne({
                    where: {
                        id: groupId,
                        status: 'success'
                    },
                    raw: true
                }),
                User.findOne({
                    where: {
                        mobile: mobile
                    },
                    raw: true
                }),
                GroupCoAdminMapping.findOne({
                    where: {
                        mobile: mobile,
                        groupId: groupId
                    },
                    raw: true
                }),
                GroupBotMapRepository.findOne({
                    groupId: groupId,
                    isPrimary: 1,
                    isActive: 1
                })
            ]);

            if (!group) {
                throw new Error('Group Not Found');
            }
            if (coAdmin) {
                throw new Error(
                    'This User has already requested for co-aadmin'
                );
            }
            if (user && user.id) {
                const memberData = await MemberGroupMap.findOne({
                    where: {
                        memberId: user.id,
                        groupId: groupId
                    },
                    raw: true
                });
                if (memberData && !memberData.joinedBy) {
                    throw new Error(
                        'Please ask the user to first join the channel'
                    );
                } else if (memberData && memberData.joinedBy) {
                    await telegram.editAdminRightsViaBot(
                        memberData.joinedBy,
                        group.channelId,
                        botToken.botToken.token,
                        0
                    );

                    const [coAdmin] = await Promise.all([
                        GroupCoAdminMapping.create({
                            groupId: groupId,
                            joinedBy: memberData.joinedBy,
                            name: name,
                            mobile: mobile,
                            inviteLink: memberData.inviteLink
                        }),
                        MemberGroupMap.update(
                            {
                                expiryDate: null,
                                expiryTimestamp: null
                            },
                            {
                                where: {
                                    memberId: user.id,
                                    groupId: groupId
                                }
                            }
                        )
                    ]);

                    return {
                        ...coAdmin,
                        upgradedToAdmin: true
                    };
                }
            }
            const redisLink = await RedisManager.popFromSet(
                String(group.id),
                1
            );

            coAdminInviteLink =
                (redisLink.length && redisLink[0]) ||
                (await telegram.createInviteLinkBot(
                    group.channelId,
                    botToken.botToken.token,
                    false,
                    group.conditionalApproval
                ));

            if (!coAdminInviteLink) {
                throw new Error(
                    "Couldn't generate invite Link , please try again in some time"
                );
            }
            console.log('COADMIN INVITE LINK', coAdminInviteLink);

            coAdminInviteLink &&
                FreshchatService.sendCoAdminFreshchatServiceRequest(
                    group.groupName,
                    coAdminInviteLink.replace('t.me', 'telegram.me'),
                    mobile,
                    group.id
                );
            coAdminInviteLink &&
                RedisManager.addToHashmap(coAdminInviteLink, {
                    groupName: group.groupName,
                    name: name,
                    mobile: mobile,
                    groupId,
                    type: 'coAdmin',
                    token: botToken.botToken.token
                });

            const coAdminDetails = await GroupCoAdminMapping.create({
                name: name,
                mobile: mobile,
                inviteLink: coAdminInviteLink,
                groupId: groupId
            });
            return {
                ...coAdminDetails,
                upgradedToAdmin: false
            };
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    async GetGeoupCoAdminList(groupId: number) {
        try {
            const coAdmins = await GroupCoAdminMapping.findAll({
                where: {
                    groupId: groupId
                },
                raw: true
            });
            return new ResponseBuilder(200, coAdmins, SUCCESS_200);
        } catch (error) {
            return new ResponseBuilder(400, { error: error }, ERROR_400);
        }
    }

    async removeFromGroup() {
        try {
            const actualExpiredMemebers = [];
            const expiredUsers: any = await sequelize.query(
                `
					SELECT DISTINCT(mgm.id) as mgmId, mgm.memberId, u.whatsappStatus, mgm.memberId,  mgm.joinedBy , u.email ,u.mobile, u.name as userName, ad.name as adminName,
					gd.groupName as channelName,gd.id as groupId ,   gd.channelId, gd.type
					from member_group_map mgm 
					INNER JOIN users u ON u.id = mgm.memberId 
					INNER JOIN group_details gd ON gd.id = mgm.groupId
					INNER JOIN users ad ON ad.id = gd.createdBy
					WHERE DATE(mgm.expiryDate) < CURDATE() AND mgm.isActive=1
					AND gd.type IN ('whatsappGroup', 'whatsappCommunity')
					LIMIT 10
			`,
                {
                    raw: true,
                    nest: true
                }
            );
            console.log('users to be expired via phone -', 'are', expiredUsers);
            if (!expiredUsers || !expiredUsers.length) {
                return true;
            }

            for (const user of expiredUsers) {
                const randInt = randomIntFromInterval(0, 2);
                let primaryPhone;
                const [primaryNumber, secondaryNumber] = await Promise.all([
                    phoneIdRepository.findActivePhone(user.groupId),
                    phoneIdRepository.findNonprimaryPhone(user.groupId)
                ]);
                if (!primaryNumber && !secondaryNumber) {
                    // TODO: ALERT
                    continue;
                } else if (!primaryNumber) {
                    primaryPhone = secondaryNumber;
                } else if (!secondaryNumber) {
                    primaryPhone = primaryNumber;
                } else {
                    primaryPhone =
                        randInt == 0 ? primaryNumber : secondaryNumber;
                }

                if (user.joinedBy && primaryPhone) {
                    let data = JSON.stringify({
                        conversation_id: `${user.channelId}@g.us`,
                        number: `${user.mobile}@c.us`
                    });

                    const banUser = await whatsappConfig.removeFromGroup(
                        data,
                        primaryPhone.phone.phoneId
                    );

                    if (!banUser || !banUser.success) {
                        sendNotificationToGoogleChat(REMOVAL_CHAT_URL, {
                            source: 'ABORTING REMOVE FROM CHANNEL',
                            data: {
                                phoneId: primaryPhone.phone.phone,
                                mobile: user.mobile,
                                groupId: user.groupId
                            }
                        });
                        continue;
                    }

                    console.log('userBan', banUser, user.memberId);

                    actualExpiredMemebers.push(user.mgmId);

                    const encryptMember = await this.getEncryptedmember(
                        String(user.memberId)
                    );
                    const encryptGroup = await this.getEncryptedGroup(
                        String(user.groupId)
                    );

                    // await Group.sendSms(
                    //     [user.mobile],
                    //     user.id,
                    //     undefined,
                    //     user.groupId,
                    //     {
                    //         userName: user.userName,
                    //         groupName: user.channelName,
                    //         adminName: user.adminName,
                    //         paymentLink: `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`
                    //     },
                    //     process.env.COMM_ACCESS_SMS_SUBSCRIPTION_EXPIRED,
                    //     'subscriptionExpired'
                    // );
                    const emailTemplateData = {
                        userName: user.userName,
                        groupName: user.channelName,
                        adminName: user.adminName,
                        renewSubscriptionLink: `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`
                    };

                    if (user.email) {
                        await Group.sendEmail(
                            [user.email],
                            process.env.COMM_ACCESS_EMAIL_SUBSCRIPTION_EXPIRY,
                            Number(
                                process.env
                                    .COMM_ACCESS_EMAIL_SUBSCRIPTION_EXPIRY_TEMPLATE
                            ),
                            null,
                            emailTemplateData
                        );
                    }

                    let type =
                        user.type == 'whatsappGroup'
                            ? 'Whatsapp Group'
                            : 'Whatsapp Community';

                    FreshchatService.sendWAplanExpiryFreshchatServiceRequest(
                        user.userName,
                        user.channelName,
                        type,

                        `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`,
                        user.mobile,
                        user.groupId
                    );

                    const delay = randomIntFromInterval(15, 34);

                    await telegram.sleep(delay * 900);
                }
            }
            await MemberGroupMapRepository.updateActiveStatus(
                { id: actualExpiredMemebers },
                0
            );
            return true;
        } catch (error) {
            console.error(error);
            return true;
        }
    }

    async logsCronJob() {
        try {
            const pendingLogs: any = await sequelize.query(
                `
				SELECT 	id,requestId, status FROM communication_log WHERE status='Queued' OR status = 'Sent' LIMIT 50;
			`,
                {
                    raw: true,
                    nest: true
                }
            );
            console.log('communication logs to be checked', pendingLogs);
            if (!pendingLogs || !pendingLogs.length) {
                return true;
            }

            for (const item of pendingLogs) {
                const result = await freshchatService.getRequestDetails(
                    item.requestId
                );
                if (!result) {
                    continue;
                }
                if (
                    (result.outbound_messages[0].status == 'SENT' &&
                        item.status == 'Sent') ||
                    (result.outbound_messages[0].status == 'IN-PROGRESS' &&
                        item.status == 'Queued')
                ) {
                    continue;
                }
                let status;
                let reason = null;
                if (result.outbound_messages[0].status == 'SENT') {
                    status = 'Sent';
                }
                if (result.outbound_messages[0].status == 'DELIVERED') {
                    status = 'Delivered';
                }
                if (result.outbound_messages[0].status == 'READ') {
                    status = 'Read';
                }
                if (result.outbound_messages[0].status == 'FAILED') {
                    status = 'Failed';
                    reason = result.outbound_messages[0].failure_reason;
                }

                await CommunicationLogs.update(
                    {
                        status,
                        error: reason
                    },
                    {
                        where: {
                            id: item.id
                        }
                    }
                );
            }

            return true;
        } catch (error) {
            console.error(error);
            return true;
        }
    }

    async generateBulkPaymentLinks(data: any) {
        try {
            const { groupId, membersData } = data;
            const finalData = {
                successCount: 0,
                successData: []
            };
            const groupDetails = await GroupDetails.findOne({
                where: {
                    id: groupId,
                    status: 'success'
                },
                raw: true
            });

            const bankDetails = await BankDetail.findOne({
                where: {
                    userId: groupDetails.createdBy,
                    isPrimary: 1
                },
                raw: true
            });
            let CorrespondingPayment;
            if (!groupDetails) {
                throw new Error('Invalid Group Details');
            }
            const creatorPercentage = await CreatorInfo.findOne({
                where: {
                    userId: groupDetails.createdBy
                },
                raw: true
            });
            for (let member of membersData) {
                if (moment() > moment(member.expiryDate)) {
                    continue;
                }
                console.log(member);
                let user = await User.findOne({
                    where: {
                        mobile: member.mobile
                    },
                    raw: true
                });
                if (user) {
                    const PreviousPaymentLink =
                        await RazorpayLinksMapping.findOne({
                            where: {
                                userId: user.id,
                                status: 'served'
                            },
                            order: [['createdAt', 'desc']],
                            raw: true
                        });
                    console.log('last Paymnet data', PreviousPaymentLink);
                    if (PreviousPaymentLink) {
                        CorrespondingPayment = await PaymentTable.findOne({
                            where: {
                                id: PreviousPaymentLink.paymentId
                            },
                            raw: true
                        });
                        console.log(
                            'last Paymnet data',
                            PreviousPaymentLink,
                            CorrespondingPayment
                        );
                        if (
                            (CorrespondingPayment.status === 'Initiated' ||
                                CorrespondingPayment.status === 'Failed') &&
                            PreviousPaymentLink.status !== 'revoked'
                        ) {
                            await Promise.all([
                                razorpayService.cancelPaymentLink(
                                    PreviousPaymentLink.linkId
                                ),
                                RazorpayLinksMapping.update(
                                    {
                                        status: 'revoked'
                                    },
                                    {
                                        where: {
                                            id: PreviousPaymentLink.id
                                        }
                                    }
                                )
                            ]);
                        }
                    }
                }
                if (!user) {
                    const userWithSameEmail = await User.findOne({
                        where: {
                            email: member.email
                        },
                        raw: true,
                        attributes: ['id']
                    });
                    user = await User.create({
                        mobile: member.mobile,
                        email: !userWithSameEmail ? member.email : null,
                        name: member.name,
                        whatsappStatus: 1
                    });
                }
                const referenceNumber = new Date().getTime();
                console.log('user', user);
                let cpCommision =
                    (member.amount *
                        Number(creatorPercentage.fankonnectCommisionPerc)) /
                    100;
                let tutorAmount = member.amount - cpCommision;
                const razrpayLink = await razorpayService.generatePaymentLink({
                    amount: Number(member.amount) * 100,
                    name: user.name,
                    email: user.email,
                    mobile: member.mobile,
                    description: groupDetails.groupName,
                    referenceId: String(referenceNumber),
                    transfer: [
                        {
                            account: bankDetails.accountId,
                            amount: Number(tutorAmount) * 100,
                            currency: 'INR'
                        }
                    ]
                });

                if (!razrpayLink || !razrpayLink.short_url) {
                    await RazorpayLinksMapping.create({
                        amount: Number(member.amount),
                        status: 'failed',
                        paymentId: 0,
                        referenceId: '',
                        paymentLink: '',
                        linkId: '',
                        groupId: groupId,
                        userId: user.id,
                        expiryDate: member.expiryDate
                    });
                    continue;
                }
                const payment = await PaymentTable.create({
                    buyerId: user.id,
                    sellerId: groupDetails.createdBy,
                    migrated: 1,
                    groupId: groupDetails.id,
                    amount: Number(member.amount),
                    orderType: 'group',
                    currentPlan: '',
                    fankonnectCommission: Number(cpCommision),
                    renewed: CorrespondingPayment ? 1 : 0,
                    orderId: '',
                    status: 'Initiated'
                });
                const razorpayLinksMapping = await RazorpayLinksMapping.create({
                    amount: Number(member.amount),
                    status: 'served',
                    paymentId: payment.id,
                    referenceId: String(referenceNumber),
                    paymentLink: razrpayLink.short_url,
                    linkId: razrpayLink.id,
                    groupId: groupId,
                    userId: user.id,
                    expiryDate: member.expiryDate
                });
                const creatorName = await User.findOne({
                    where: {
                        id: groupDetails.createdBy
                    },
                    attributes: ['name'],
                    raw: true
                });
                await Group.sendSms(
                    [user.mobile],
                    user.id,
                    undefined,
                    groupId,
                    {
                        userName: user.name,
                        groupName: groupDetails.groupName,
                        adminName: creatorName.name,
                        paymentLink: razrpayLink.short_url
                    },
                    process.env.COMM_ACCESS_SMS_SUBSCRIPTION_EXPIRED,
                    'subscriptionExpired'
                );
                const emailTemplateData = {
                    userName: user.name,
                    groupName: groupDetails.groupName,
                    adminName: creatorName.name,
                    renewSubscriptionLink: razrpayLink.short_url
                };

                if (user.email) {
                    await Group.sendEmail(
                        [user.email],
                        process.env.COMM_ACCESS_EMAIL_SUBSCRIPTION_EXPIRY,
                        Number(
                            process.env
                                .COMM_ACCESS_EMAIL_SUBSCRIPTION_EXPIRY_TEMPLATE
                        ),
                        null,
                        emailTemplateData
                    );
                }

                FreshchatService.sendPlanExpiryFreshchatServiceRequest(
                    user.name,
                    groupDetails.groupName,
                    razrpayLink.short_url,
                    user.mobile,
                    groupDetails.id
                );

                finalData.successCount += 1;
                finalData.successData.push(member);
                console.log('razrpayLink', razrpayLink, razorpayLinksMapping);
            }
            return new ResponseBuilder(200, finalData, SUCCESS_200);
        } catch (error) {
            return new ResponseBuilder(400, { error: error }, ERROR_400);
        }
    }
}

export default new GroupServiceV2();
