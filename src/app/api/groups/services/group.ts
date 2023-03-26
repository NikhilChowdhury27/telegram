import Telegram from '../../../utils/telegram/telegram.common';
import {
    BAD_CLIENT_REQUEST_400,
    // ALREADY_A_MEMBER,
    ERROR_400,
    FORBIDDEN_ACCESS,
    GROUP_CREATE_PENDING,
    GROUP_CREATE_SUCCESS,
    INVALID_GROUP,
    SUCCESSFULLY_FETCHED,
    SUCCESSFULLY_LISTED,
    SUCCESSFULLY_UPDATED,
    SUCCESS_200,
    TOKEN_INVALID
} from '../../../../config/constants/errorMessages';
import GroupDetailsRepository from '../../../repository/group.repository';
import GroupBotRepository from '../../../repository/group.bot.map.repository';
import CommonService from '../../../utils/common.service';
import groupBotRepository from '../../../repository/group.bot.map.repository';
import {
    IGroup,
    // IGroupCreate,
    IGroupListPayload,
    IJoinGroupParam,
    IPricing
} from '../group.interface';
import MemberGroupMapRepository from '../../../repository/member.group.map';
const { ResponseBuilder } = require('base-packages');
// import * as htmlTopdf from 'html-pdf-node';
// import * as puppeteer from 'puppeteer';
import * as converter from 'number-to-words';
import _ from 'underscore';
import userRepository from '../../../repository/user.repository';
import GroupBotMapRepository from '../../../repository/group.bot.map.repository';
import * as moment from 'moment';
import { IAllListMember } from '../../members/member.interface';
import Group from '../../../utils/group';
import telegram from '../../../utils/telegram/telegram.common';
import { Op, QueryTypes } from 'sequelize';
// const bPromise = require('bluebird');
import { sequelize } from '../../../../sequelize';
import memberGroupMap from '../../../repository/member.group.map';
import RedisManager from '../../../../config/conf/RedisCache';
import Common from '../../../../config/constants/common';
import {
    additionRateDifference,
    additionThreshhold,
    TOKEN_CHAT_URL,
    WHATSAPP_USER_ADDITION
} from '../../../../config/constant';
import sessionToken from '../../../../app/repository/session.token';
const axios = require('axios');

import paymentRepository from '../../../repository/payment.repository';
import { sendNotificationToGoogleChat } from '../../../utils/alert.utils';
import { REMOVAL_CHAT_URL } from '../../../../config/constant';
import { sign, SignOptions } from 'jsonwebtoken';
import GroupBotMap from '../../../../models/groupBotMap';
import PaymentTable from '../../../../models/PaymentTable';
import User from '../../../../models/User';
import BotToken from '../../../../models/BotToken';
import MemberGroupMap from '../../../../models/MemberGroupMap';
import GroupDetails from '../../../../models/GroupDetail';
import receiptDetailsRepository from '../../../repository/receipt.details.repository';
import leading_zero from '../../../utils/number.invoice';
import GroupPlanRepository from '../../../repository/group.subscription.plan';
import FreshchatService from '../../../utils/freshchat/freshchat.service';
import { sendMailGunMail } from '../../../utils/mailgun.manual';
import { getNewPaymentTemplate } from '../../../utils/templates';
import GroupSubscriptionPlans from '../../../../models/GroupSubscriptionPlan';
import botTokenRepository from '../../../../app/repository/bot.token.repository';
import memberService from '../../members/services/member.service';
import CreatorInfo from '../../../../models/CreatorInfo';
import whatsappAutomation from '../../../../app/utils/whatsapp/whatsapp.common';
import whatsappConfig from '../../../../app/utils/whatsapp/whatsapp.config';
import phoneIdRepository from '../../../../app/repository/phone.id.repository';
import freshchatService from '../../../utils/freshchat/freshchat.service';
class groupService extends CommonService {
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
            console.log('PAY-1', payload);

            const pricing = payload.pricing.map((period) => {
                if (period.selectedPeriod == 'Custom Period') {
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
                category: payload.category
            };

            console.log('group creation payload', group);
            // const createdResult: any = await GroupDetailsRepository.addGroup(
            //     group
            // );

            // pre created groups fetch
            let createdResultPre: any = await GroupDetailsRepository.findGroup({
                status: 'ready'
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
                        status: 'pending'
                    }
                ));
            console.log('UPDATED_INFO', updatedInfo);
            const createdResult: any =
                createdResultPre ||
                (await GroupDetailsRepository.addGroup(group));

            let botToken: GroupBotMap;

            if (createdResultPre) {
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
                //     description: group.about
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

                this.editTgChannel(reqOptions);
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
            createdResult.inviteLink &&
                (await Promise.all([
                    RedisManager.addToHashmap(createdResult.inviteLink, {
                        groupName: group.groupName,
                        name: userObj.name,
                        mobile: userObj.mobile,
                        groupId: createdResult.id,
                        userId: userObj.id,
                        type: 'group',
                        token: botToken ? botToken.botToken.token : null
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
                ]));

            createdResult.inviteLink &&
                RedisManager.expireKey(
                    createdResult.inviteLink,
                    7 * 24 * 60 * 60
                );
            // TODO:
            // createdResult.dataValues.popupMessage = {
            //     logoLink:
            //         'https://storage.googleapis.com/cp-prod-cloudinary-as-sth1-gcs-iu7ed8/web/fanKonnect/telegram.png',
            //     headerText: 'Channel Creation In Progress',
            //     subText:
            //         'Your channel creation is in progress. It may take upto 2 hours in some cases.',
            //     inviteLink: createdResult.inviteLink
            // };
            // TODO://
            // console.log('created2', createdResult);
            // payload['groupId'] = createdResult.id;
            // payload['type'] = 'group';
            // Send a message to the topic
            // if (parseInt(process.env.IS_PUBSUB_ENABLED)) {
            //     PubSubService.sendMessage(
            //         payload,
            //         process.env.PUBSUB_TELEGRAM_TOPIC,
            //         {
            //             type: 'createChannel'
            //         }
            //     );
            // }
            // const resp: any = await Telegram.createChannel(payload);
            // if (resp instanceof Error) {
            //     return new ResponseBuilder(500, {}, resp.message);
            // }
            // console.log('channel created ', resp);
            return new ResponseBuilder(
                200,
                createdResult,
                createdResultPre ? GROUP_CREATE_PENDING : GROUP_CREATE_SUCCESS
            );
        } catch (err) {
            console.log('err in group creation in db', err);
        }
    }

    async list(payload: IGroupListPayload, userId) {
        payload.limit = payload.limit
            ? isNaN(Number(payload.limit))
                ? 10
                : Number(payload.limit)
            : 10;
        payload.offset = payload.offset
            ? isNaN(Number(payload.offset))
                ? 0
                : Number(payload.offset)
            : 0;
        payload.userId = userId;
        let resp = [];
        switch (payload.status) {
            // TODO: isActive vs status conflict solve
            case 'created':
                resp = await GroupDetailsRepository.list(
                    {
                        createdBy: payload.userId
                    },
                    {
                        attributes: [
                            'id',
                            'groupName',
                            'isActive',
                            'about',
                            'subscriptionPlan',
                            'createdBy',
                            'memberCount',
                            'createdAt',
                            'updatedAt',
                            'channelId',
                            ['totalRevenue', 'revenue'],
                            'channelHash',
                            'status',
                            'inviteLink',
                            'category',
                            'logoUrl',
                            'type'
                        ],
                        limit: payload.limit,
                        offset: payload.offset,
                        order: [['createdAt', 'DESC']]
                    }
                );
                for (let group of resp) {
                    const totalEarnings = await PaymentTable.findAll({
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
                            groupId: group.id,
                            migrated: null,
                            [Op.or]: [
                                { status: 'Success' },
                                { paymentStatus: 'success' }
                            ]
                        }
                    });

                    group['revenue'] =
                        totalEarnings.length &&
                        totalEarnings[0]['dataValues']['totalIncome']
                            ? Number(
                                  totalEarnings[0]['dataValues'][
                                      'totalIncome'
                                  ].toFixed(2)
                              )
                            : 0;
                }
                break;
            case 'subscribed':
                // Find groupIds joined by user
                const members = await MemberGroupMapRepository.getJoinedGroup(
                    {
                        memberId: payload.userId,
                        status: 'active'
                    },
                    ['groupId'],
                    {
                        limit: payload.limit,
                        offset: payload.offset,
                        order: [['joinedDate', 'DESC']]
                    }
                );
                const groupIds = _.pluck(members, 'groupId');
                if (!groupIds || !groupIds.length) {
                    return new ResponseBuilder(200, [], SUCCESSFULLY_FETCHED);
                }
                resp = await GroupDetailsRepository.list(
                    {
                        id: groupIds
                    },
                    {}
                );
                break;
            default:
                return new ResponseBuilder(401, [], FORBIDDEN_ACCESS);
        }
        for (let r of resp) {
            let channel = 'telegram';
            if (r.type == 'whatsappGroup' || r.type == 'whatsappCommunity') {
                channel = 'whatsapp';
            }
            r.paymentLink = `${process.env.PAYMENT_DOMAIN}/g/${r.id}`;
            r.shareLinks = await Group.links(
                r.id,
                r.groupName,
                r.about,
                null,
                channel
            );
            r.inviteLink = r.inviteLink
                ? r.inviteLink.replace('t.me', 'telegram.me')
                : null;
        }
        return new ResponseBuilder(200, resp, SUCCESSFULLY_FETCHED);
    }

    async listAll(userId) {
        const resp = await GroupDetailsRepository.list(
            {
                createdBy: userId,
                status: 'success'
            },
            {
                attributes: ['id', 'groupName', 'type'],

                order: [['createdAt', 'DESC']]
            }
        );

        return new ResponseBuilder(200, resp, SUCCESSFULLY_FETCHED);
    }

    /**
     *
     * @param groupId requested group ID
     * @param userId payer user ID
     * @param plan stringify subscription plan
     * @param amount amount payed
     */
    async join(payload: IJoinGroupParam) {
        const { groupId, userId, plan, amount, paymentId, planId } = payload;
        const groupDetails = await GroupDetailsRepository.findGroupById(
            groupId
        );
        const creatorData = await userRepository.findOneById(
            groupDetails.createdBy
        );
        if (!groupDetails) {
            throw new Error(INVALID_GROUP);
        }
        const user = await userRepository.findOneById(userId);
        // const [user] = await Promise.all([
        //     userRepository.findOneById(userId),
        //     userRepository.findOneById(groupDetails.createdBy)
        // ]);
        if (!user) {
            throw new Error(TOKEN_INVALID);
        }

        const isAlreadyJoined =
            await MemberGroupMapRepository.hasMemberJoinedGroup2(
                groupId,
                userId
            );
        console.log('ALREADY JOINED', isAlreadyJoined[0]);
        // if (isAlreadyJoined) {
        //     throw new Error(ALREADY_A_MEMBER);
        // }

        // join group on telegram

        // if (!user.telegramUserId) {
        //     const telegramUserRes: any = await Telegram.checkAndUpdateUser({
        //         mobile: user.mobile,
        //         id: user.id
        //     });

        //     if (!telegramUserRes && !telegramUserRes.id) {
        //         return {
        //             statusCode: 400,
        //             message: 'Telegram User Not Found',
        //             data: {}
        //         };
        //     }
        //     user.telegramUserId = telegramUserRes.id;
        //     user.telegramAccessHash = telegramUserRes.accessHash;
        // }
        // const telegramPayload: any = {
        //     channelId: groupDetails.channelId,
        //     channelHash: groupDetails.channelHash,
        //     telegramUserId: user.telegramUserId,
        //     telegramAccessHash: user.telegramAccessHash
        // };

        let member: any = {
            groupId: groupId,
            memberId: userId,
            joinedDate: new Date(),
            paymentId: paymentId,
            isActive: false,
            currentPlan: plan,
            groupName: groupDetails.groupName,
            isAdded: 0,
            status: 'pending',
            planId: planId
        };

        // shifting group code block above

        const subscriptionPlan: IPricing = planId
            ? await GroupPlanRepository.findPlanById(planId)
            : JSON.parse(plan);
        console.log('SUB-2', subscriptionPlan);

        // if (subscriptionPlan.paymentPeriod ) {
        //     const days =
        //         Common.SUBSCRIPTION_MAPPING[
        //             `${subscriptionPlan.paymentPeriod.period}`
        //         ];
        //     console.log('DAYS', days);
        //     const earlierExpiry = isAlreadyJoined[0]
        //         ? moment(isAlreadyJoined[0].expiryDate)
        //         : moment();
        //     const earlierExpiryTimestamp = isAlreadyJoined[0]
        //         ? moment(isAlreadyJoined[0].expiryTimestamp)
        //         : moment();
        //     console.log(earlierExpiry);
        //     const expiryIsOld = moment().diff(earlierExpiry, 'days') > 0;
        //     console.log('isOld', expiryIsOld);

        //     member.expiryDate = !expiryIsOld
        //         ? moment(earlierExpiry).add(days, 'days').format('YYYY-MM-DD')
        //         : moment().add(days, 'days')'YYYY-MM-DD');
        //     member.expiryTimestamp = !expiryIsOld
        //         ? moment(earlierExpiryTimestamp)
        //               .add(days, 'days')
        //               .format('YYYY-MM-DD HH:mm:ss')
        //         : moment().add(days, 'days').format('YYYY-MM-DD HH:mm:ss');
        // }
        member.groupId = groupId;
        member.memberId = userId;
        console.log(
            `member log while joining group id -> ${member.groupId} `,
            member
        );
        let botToken: GroupBotMap;

        if (isAlreadyJoined[0] && isAlreadyJoined[0].isActive) {
            //  if not yet expired, just increase expiryDates
            if (subscriptionPlan.selectedPeriod !== 'Lifetime') {
                const days =
                    subscriptionPlan.selectedPeriod == 'Custom Period'
                        ? Common.CUSTOM_SUBSCRIPTION_MAPPING[
                              subscriptionPlan.customType
                          ] * subscriptionPlan.customValue
                        : Common.SUBSCRIPTION_MAPPING[
                              `${subscriptionPlan.selectedPeriod}`
                          ];
                console.log('DAYS', days);
                const earlierExpiry = isAlreadyJoined[0]
                    ? moment(isAlreadyJoined[0].expiryDate)
                    : moment();
                const earlierExpiryTimestamp = isAlreadyJoined[0]
                    ? moment(isAlreadyJoined[0].expiryTimestamp)
                    : moment();
                console.log('previous expiry', earlierExpiry);
                const expiryIsOld = moment().diff(earlierExpiry, 'days') > 0;
                console.log('isOld', expiryIsOld);

                member.expiryDate = !expiryIsOld
                    ? moment(earlierExpiry)
                          .add(days, 'days')
                          .format('YYYY-MM-DD')
                    : moment().add(days, 'days').format('YYYY-MM-DD');
                member.expiryTimestamp = !expiryIsOld
                    ? moment(earlierExpiryTimestamp)
                          .add(days, 'days')
                          .format('YYYY-MM-DD HH:mm:ss')
                    : moment().add(days, 'days').format('YYYY-MM-DD HH:mm:ss');
            }

            // if isLeft==1 then check if link is there or not
            if (isAlreadyJoined[0].isLeft) {
                let inviteLinkLeaveCase = '';
                if (isAlreadyJoined[0].inviteLink) {
                    // skip link generation
                    inviteLinkLeaveCase = isAlreadyJoined[0].inviteLink;
                } else {
                    // generate link
                    botToken = await GroupBotMapRepository.findOne({
                        groupId: groupId,
                        isPrimary: 1,
                        isActive: 1
                    });

                    const alter = Math.round(Math.random());

                    const redisLink = alter
                        ? await RedisManager.popFromSet(
                              String(groupDetails.id),
                              1
                          )
                        : 0;
                    console.log(
                        'INVITE LINK FOUND IN REDIS:',
                        redisLink,
                        alter
                    );

                    inviteLinkLeaveCase =
                        (redisLink.length && redisLink[0]) ||
                        (await telegram.createInviteLinkBot(
                            groupDetails.channelId,
                            botToken.botToken.token,
                            false,
                            groupDetails.conditionalApproval
                        ));

                    member.inviteLink = inviteLinkLeaveCase || null;

                    inviteLinkLeaveCase &&
                        RedisManager.addToHashmap(inviteLinkLeaveCase, {
                            groupName: groupDetails.groupName,
                            name: user.name,
                            mobile: user.mobile,
                            groupId,
                            userId: user.id,
                            type: 'member',
                            token: botToken.botToken.token,
                            currentPlan: plan,
                            status: 'left',
                            // status: isAlreadyJoined[0].status,
                            planId: planId || 0
                        });
                }

                // send sms,email
                const emailTemplateData = {
                    userName: user.name,
                    groupName: groupDetails.groupName,
                    adminName: creatorData.name,
                    inviteLink: inviteLinkLeaveCase
                        ? inviteLinkLeaveCase.replace('t.me', 'telegram.me')
                        : ''
                };
                inviteLinkLeaveCase &&
                    Group.sendSms(
                        [user.mobile],
                        user.id,
                        undefined,
                        groupId,
                        {
                            userName: user.name,
                            inviteLink: encodeURIComponent(
                                encodeURIComponent(inviteLinkLeaveCase)
                            ),
                            groupName: groupDetails.groupName
                        },
                        process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                        'memberAddition'
                    );
                user.email &&
                    inviteLinkLeaveCase &&
                    Group.sendEmail(
                        [user.email],
                        process.env.COMM_ACCESS_EMAIL_GROUP_ADDITION,
                        Number(
                            process.env
                                .COMM_ACCESS_EMAIL_GROUP_ADDITION_TEMPLATE
                        ),
                        null,
                        emailTemplateData
                    );
                user.whatsappStatus &&
                    inviteLinkLeaveCase &&
                    FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                        user.name,
                        groupDetails.groupName,
                        inviteLinkLeaveCase.replace('t.me', 'telegram.me'),
                        user.mobile,
                        groupId
                    );
            }
            const emailTemplateData = {
                userName: user.name,
                groupName: groupDetails.groupName,
                adminName: creatorData.name
            };

            this.sendMailWithInvoice(
                paymentId,
                user,

                amount,
                emailTemplateData
            );
            await Promise.all([
                memberGroupMap.updateGroupMemberStatus(member, 'success'),
                GroupDetailsRepository.updateGroupIncome(member, amount)
            ]);
            if (
                isAlreadyJoined[0] &&
                !isAlreadyJoined[0].joinedBy &&
                isAlreadyJoined[0].inviteLink
            ) {
                Group.sendSms(
                    [user.mobile],
                    user.id,
                    undefined,
                    groupId,
                    {
                        userName: user.name,
                        inviteLink: encodeURIComponent(
                            encodeURIComponent(isAlreadyJoined[0].inviteLink)
                        ),
                        groupName: groupDetails.groupName
                    },
                    process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                    'memberAddition'
                );
                user.whatsappStatus &&
                    isAlreadyJoined[0].inviteLink &&
                    FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                        user.name,
                        groupDetails.groupName,
                        isAlreadyJoined[0].inviteLink.replace(
                            't.me',
                            'telegram.me'
                        ),
                        user.mobile,
                        groupId
                    );
            }
        } else if (
            isAlreadyJoined[0] &&
            isAlreadyJoined[0].memberStatus == 'expired'
        ) {
            // if expired some days ago, generate link and assign
            // const link = await RedisManager.popFromSet(String(groupId), 1);
            botToken = await GroupBotMapRepository.findOne({
                groupId: groupId,
                isPrimary: 1,
                isActive: 1
            });

            // const alter = Math.round(Math.random());

            // const redisLink = alter
            //     ? await RedisManager.popFromSet(String(groupDetails.id), 1)
            //     : 0;
            // console.log('INVITE LINK FOUND IN REDIS:', redisLink, alter);

            const inviteLink = await telegram.createInviteLinkBot(
                groupDetails.channelId,
                botToken.botToken.token,
                false,
                0
            );

            let emailTemplateData = {
                userName: user.name,
                groupName: groupDetails.groupName,
                adminName: creatorData.name,
                inviteLink: inviteLink
                    ? inviteLink.replace('t.me', 'telegram.me')
                    : ''
            };

            if (groupDetails.conditionalApproval) {
                if (groupDetails.formLink) {
                    emailTemplateData['formLink'] = groupDetails.formLink;
                }
            }
            console.log('invite link for member:', inviteLink);

            // member.inviteLink = inviteLink || null;
            await Promise.all([
                memberGroupMap.updateGroupMemberStatus(
                    {
                        ...member,
                        memberStatus: 'renewed',
                        inviteLink: inviteLink
                    },
                    'pending'
                ),
                GroupDetailsRepository.updateGroupIncome(member, amount)
            ]);

            inviteLink &&
                Group.sendSms(
                    [user.mobile],
                    user.id,
                    undefined,
                    groupId,
                    {
                        userName: user.name,
                        inviteLink: encodeURIComponent(
                            encodeURIComponent(inviteLink)
                        ),
                        groupName: groupDetails.groupName
                    },
                    process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                    'memberAddition'
                );
            user.email &&
                inviteLink &&
                this.sendMailWithInvoice(
                    paymentId,
                    user,

                    amount,
                    emailTemplateData
                );
            user.whatsappStatus &&
                inviteLink &&
                FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                    user.name,
                    groupDetails.groupName,
                    inviteLink.replace('t.me', 'telegram.me'),
                    user.mobile,
                    groupId
                );
            inviteLink &&
                RedisManager.addToHashmap(inviteLink, {
                    groupName: groupDetails.groupName,
                    name: user.name,
                    mobile: user.mobile,
                    groupId,
                    userId: user.id,
                    type: 'member',
                    token: botToken.botToken.token,
                    currentPlan: plan,
                    status: 'pending',
                    planId: planId || 0
                });
        }

        // new joinee

        if (isAlreadyJoined.length <= 0) {
            // bot token flow
            botToken = await GroupBotMapRepository.findOne({
                groupId: groupId,
                isActive: 1
            });

            // const alter = Math.round(Math.random());
            const key = `link-${groupDetails.id}`;

            const redisIncrby = await RedisManager.incrCount(key);
            console.log(redisIncrby, typeof redisIncrby);

            const alter = redisIncrby >= 5 ? 0 : 1;
            redisIncrby >= 5 && RedisManager.setMember(key, 0);
            const redisLink = alter
                ? await RedisManager.popFromSet(String(groupDetails.id), 1)
                : [];
            console.log('INVITE LINK FOUND IN REDIS:', redisLink, alter);

            const inviteLink =
                (redisLink.length && redisLink[0]) ||
                (await telegram.createInviteLinkBot(
                    groupDetails.channelId,
                    botToken.botToken.token,
                    false,
                    groupDetails.conditionalApproval
                ));

            let emailTemplateData = {
                userName: user.name,
                groupName: groupDetails.groupName,
                adminName: creatorData.name,
                inviteLink: inviteLink
                    ? inviteLink.replace('t.me', 'telegram.me')
                    : ''
            };

            if (groupDetails.conditionalApproval) {
                if (groupDetails.formLink) {
                    emailTemplateData['formLink'] = groupDetails.formLink;
                }
            }
            console.log('invite link for member:', inviteLink);
            // const link = inviteLink;
            member.inviteLink = inviteLink || null;
            await GroupDetailsRepository.joinGroup(
                {
                    ...member,
                    memberStatus: 'renewed'
                },
                amount
            );

            member.inviteLink &&
                Group.sendSms(
                    [user.mobile],
                    user.id,
                    undefined,
                    groupId,
                    {
                        userName: user.name,
                        inviteLink: encodeURIComponent(
                            encodeURIComponent(member.inviteLink)
                        ),
                        groupName: groupDetails.groupName
                    },
                    process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                    'memberAddition'
                );
            user.email &&
                member.inviteLink &&
                this.sendMailWithInvoice(
                    paymentId,
                    user,

                    amount,
                    emailTemplateData
                );
            user.whatsappStatus &&
                member.inviteLink &&
                FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                    user.name,
                    groupDetails.groupName,
                    member.inviteLink.replace('t.me', 'telegram.me'),
                    user.mobile,
                    groupId
                );
            member.inviteLink &&
                RedisManager.addToHashmap(member.inviteLink, {
                    groupName: groupDetails.groupName,
                    name: user.name,
                    mobile: user.mobile,
                    groupId,
                    userId: user.id,
                    type: 'member',
                    token: botToken.botToken.token,
                    currentPlan: plan,
                    status: 'pending',
                    planId: planId || 0
                });

            groupDetails.conditionalApproval &&
                groupDetails.formLink &&
                FreshchatService.sendConditionalFormLinkFreshchatServiceRequest(
                    user.name,
                    groupDetails.groupName,
                    groupDetails.formLink,
                    user.mobile,
                    groupId
                );
        }

        member.inviteLink &&
            RedisManager.expireKey(member.inviteLink, 7 * 24 * 60 * 60);

        // try {
        //     // call publisher here
        //     // if (parseInt(process.env.IS_PUBSUB_ENABLED)) {
        //     //     PubSubService.sendMessage(
        //     //         {
        //     //             telegramPayload: telegramPayload,
        //     //             member: member
        //     //         },
        //     //         process.env.PUBSUB_TELEGRAM_TOPIC2,
        //     //         {
        //     //             type: 'customerAdded'
        //     //         }
        //     //     );
        //     // }
        //     await Telegram.addUserToChannel(telegramPayload);
        // } catch (error) {
        //     // memeber group mapping entry with new status column  and error meesgae
        //     member['isAdded'] = 0;
        //     member['errorMsg'] = error;
        // }
        // end telegram
    }

    async joinPostLinkPayment(payload: IJoinGroupParam) {
        const { groupId, userId, plan, amount, paymentId, expiryDate } =
            payload;
        const groupDetails = await GroupDetailsRepository.findGroupById(
            groupId
        );
        const creatorData = await userRepository.findOneById(
            groupDetails.createdBy
        );
        if (!groupDetails) {
            throw new Error(INVALID_GROUP);
        }
        const user = await userRepository.findOneById(userId);

        if (!user) {
            throw new Error(TOKEN_INVALID);
        }

        const isAlreadyJoined =
            await MemberGroupMapRepository.hasMemberJoinedGroup2(
                groupId,
                userId
            );
        console.log('ALREADY JOINED', isAlreadyJoined[0]);
        const expiryTimestamp: any = moment(expiryDate).format(
            'YYYY-MM-DD HH:mm:ss'
        );
        let member: any = {
            groupId: groupId,
            memberId: userId,
            joinedDate: new Date(),
            paymentId: paymentId,
            isActive: false,
            currentPlan: plan,
            groupName: groupDetails.groupName,
            isAdded: 0,
            status: 'migrating',
            expiryDate: expiryDate,
            expiryTimestamp: expiryTimestamp,
            planId: null
        };

        let botToken: GroupBotMap;

        if (isAlreadyJoined[0] && isAlreadyJoined[0].isActive) {
            // if isLeft==1 then check if link is there or not
            if (isAlreadyJoined[0].isLeft) {
                let inviteLinkLeaveCase = '';
                if (isAlreadyJoined[0].inviteLink) {
                    // skip link generation
                    inviteLinkLeaveCase = isAlreadyJoined[0].inviteLink;
                } else {
                    // generate link
                    botToken = await GroupBotMapRepository.findOne({
                        groupId: groupId,
                        isPrimary: 1,
                        isActive: 1
                    });

                    const alter = Math.round(Math.random());

                    const redisLink = alter
                        ? await RedisManager.popFromSet(
                              String(groupDetails.id),
                              1
                          )
                        : 0;
                    console.log(
                        'INVITE LINK FOUND IN REDIS:',
                        redisLink,
                        alter
                    );

                    inviteLinkLeaveCase =
                        (redisLink.length && redisLink[0]) ||
                        (await telegram.createInviteLinkBot(
                            groupDetails.channelId,
                            botToken.botToken.token,
                            false,
                            groupDetails.conditionalApproval
                        ));

                    member.inviteLink = inviteLinkLeaveCase || null;

                    inviteLinkLeaveCase &&
                        RedisManager.addToHashmap(inviteLinkLeaveCase, {
                            groupName: groupDetails.groupName,
                            name: user.name,
                            mobile: user.mobile,
                            groupId,
                            userId: user.id,
                            type: 'member',
                            token: botToken.botToken.token,
                            currentPlan: plan,
                            status: 'left'
                            // status: isAlreadyJoined[0].status,
                        });
                }

                // send sms,email
                const emailTemplateData = {
                    userName: user.name,
                    groupName: groupDetails.groupName,
                    adminName: creatorData.name,
                    inviteLink: inviteLinkLeaveCase
                        ? inviteLinkLeaveCase.replace('t.me', 'telegram.me')
                        : ''
                };
                inviteLinkLeaveCase &&
                    Group.sendSms(
                        [user.mobile],
                        user.id,
                        undefined,
                        groupId,
                        {
                            userName: user.name,
                            inviteLink: encodeURIComponent(
                                encodeURIComponent(inviteLinkLeaveCase)
                            ),
                            groupName: groupDetails.groupName
                        },
                        process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                        'memberAddition'
                    );
                user.email &&
                    inviteLinkLeaveCase &&
                    Group.sendEmail(
                        [user.email],
                        process.env.COMM_ACCESS_EMAIL_GROUP_ADDITION,
                        Number(
                            process.env
                                .COMM_ACCESS_EMAIL_GROUP_ADDITION_TEMPLATE
                        ),
                        null,
                        emailTemplateData
                    );
                user.whatsappStatus &&
                    inviteLinkLeaveCase &&
                    FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                        user.name,
                        groupDetails.groupName,
                        inviteLinkLeaveCase.replace('t.me', 'telegram.me'),
                        user.mobile,
                        groupDetails.id
                    );
            }
            const emailTemplateData = {
                userName: user.name,
                groupName: groupDetails.groupName,
                adminName: creatorData.name
            };

            this.sendMailWithInvoice(
                paymentId,
                user,

                amount,
                emailTemplateData
            );
            await Promise.all([
                memberGroupMap.updateGroupMemberStatus(member, 'success'),
                GroupDetailsRepository.updateGroupIncome(member, amount)
            ]);
            if (
                isAlreadyJoined[0] &&
                !isAlreadyJoined[0].joinedBy &&
                isAlreadyJoined[0].inviteLink
            ) {
                Group.sendSms(
                    [user.mobile],
                    user.id,
                    undefined,
                    groupId,
                    {
                        userName: user.name,
                        inviteLink: encodeURIComponent(
                            encodeURIComponent(isAlreadyJoined[0].inviteLink)
                        ),
                        groupName: groupDetails.groupName
                    },
                    process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                    'memberAddition'
                );
                user.whatsappStatus &&
                    isAlreadyJoined[0].inviteLink &&
                    FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                        user.name,
                        groupDetails.groupName,
                        isAlreadyJoined[0].inviteLink.replace(
                            't.me',
                            'telegram.me'
                        ),
                        user.mobile,
                        groupDetails.id
                    );
            }
        } else if (
            isAlreadyJoined[0] &&
            isAlreadyJoined[0].memberStatus == 'expired'
        ) {
            // if expired some days ago, generate link and assign
            // const link = await RedisManager.popFromSet(String(groupId), 1);
            botToken = await GroupBotMapRepository.findOne({
                groupId: groupId,
                isPrimary: 1,
                isActive: 1
            });

            const inviteLink = await telegram.createInviteLinkBot(
                groupDetails.channelId,
                botToken.botToken.token,
                false,
                0
            );

            let emailTemplateData = {
                userName: user.name,
                groupName: groupDetails.groupName,
                adminName: creatorData.name,
                inviteLink: inviteLink
                    ? inviteLink.replace('t.me', 'telegram.me')
                    : ''
            };

            if (groupDetails.conditionalApproval) {
                if (groupDetails.formLink) {
                    emailTemplateData['formLink'] = groupDetails.formLink;
                }
            }
            console.log('invite link for member:', inviteLink);

            // member.inviteLink = inviteLink || null;
            await Promise.all([
                memberGroupMap.updateGroupMemberStatus(
                    {
                        ...member,
                        memberStatus: 'renewed',
                        inviteLink: inviteLink
                    },
                    'pending'
                ),
                GroupDetailsRepository.updateGroupIncome(member, amount)
            ]);

            inviteLink &&
                Group.sendSms(
                    [user.mobile],
                    user.id,
                    undefined,
                    groupId,
                    {
                        userName: user.name,
                        inviteLink: encodeURIComponent(
                            encodeURIComponent(inviteLink)
                        ),
                        groupName: groupDetails.groupName
                    },
                    process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                    'memberAddition'
                );
            user.email &&
                inviteLink &&
                this.sendMailWithInvoice(
                    paymentId,
                    user,

                    amount,
                    emailTemplateData
                );
            user.whatsappStatus &&
                inviteLink &&
                FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                    user.name,
                    groupDetails.groupName,
                    inviteLink.replace('t.me', 'telegram.me'),
                    user.mobile,
                    groupId
                );
            inviteLink &&
                RedisManager.addToHashmap(inviteLink, {
                    groupName: groupDetails.groupName,
                    name: user.name,
                    mobile: user.mobile,
                    groupId,
                    userId: user.id,
                    type: 'member',
                    token: botToken.botToken.token,
                    currentPlan: plan,
                    status: 'migrating'
                });
        }

        // new joinee

        if (isAlreadyJoined.length <= 0) {
            // bot token flow
            botToken = await GroupBotMapRepository.findOne({
                groupId: groupId,
                isActive: 1
            });

            // const alter = Math.round(Math.random());
            const key = `link-${groupDetails.id}`;

            const redisIncrby = await RedisManager.incrCount(key);
            console.log(redisIncrby, typeof redisIncrby);

            const alter = redisIncrby >= 5 ? 0 : 1;
            redisIncrby >= 5 && RedisManager.setMember(key, 0);
            const redisLink = alter
                ? await RedisManager.popFromSet(String(groupDetails.id), 1)
                : [];
            console.log('INVITE LINK FOUND IN REDIS:', redisLink, alter);

            const inviteLink =
                (redisLink.length && redisLink[0]) ||
                (await telegram.createInviteLinkBot(
                    groupDetails.channelId,
                    botToken.botToken.token,
                    false,
                    groupDetails.conditionalApproval
                ));

            let emailTemplateData = {
                userName: user.name,
                groupName: groupDetails.groupName,
                adminName: creatorData.name,
                inviteLink: inviteLink
                    ? inviteLink.replace('t.me', 'telegram.me')
                    : ''
            };

            if (groupDetails.conditionalApproval) {
                if (groupDetails.formLink) {
                    emailTemplateData['formLink'] = groupDetails.formLink;
                }
            }
            console.log('invite link for member:', inviteLink);
            // const link = inviteLink;
            member.inviteLink = inviteLink || null;
            await GroupDetailsRepository.joinGroup(
                {
                    ...member,
                    memberStatus: 'renewed'
                },
                amount
            );

            member.inviteLink &&
                Group.sendSms(
                    [user.mobile],
                    user.id,
                    undefined,
                    groupId,
                    {
                        userName: user.name,
                        inviteLink: encodeURIComponent(
                            encodeURIComponent(member.inviteLink)
                        ),
                        groupName: groupDetails.groupName
                    },
                    process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
                    'memberAddition'
                );
            user.email &&
                member.inviteLink &&
                this.sendMailWithInvoice(
                    paymentId,
                    user,

                    amount,
                    emailTemplateData
                );
            user.whatsappStatus &&
                member.inviteLink &&
                FreshchatService.sendJoiningLinkFreshchatServiceRequest(
                    user.name,
                    groupDetails.groupName,
                    member.inviteLink.replace('t.me', 'telegram.me'),
                    user.mobile,
                    groupId
                );
            member.inviteLink &&
                RedisManager.addToHashmap(member.inviteLink, {
                    groupName: groupDetails.groupName,
                    name: user.name,
                    mobile: user.mobile,
                    groupId,
                    userId: user.id,
                    type: 'member',
                    token: botToken.botToken.token,
                    currentPlan: plan,
                    status: 'migrating'
                });

            groupDetails.conditionalApproval &&
                groupDetails.formLink &&
                FreshchatService.sendConditionalFormLinkFreshchatServiceRequest(
                    user.name,
                    groupDetails.groupName,
                    groupDetails.formLink,
                    user.mobile,
                    groupId
                );
        }

        member.inviteLink &&
            RedisManager.expireKey(member.inviteLink, 7 * 24 * 60 * 60);
    }

    async whatsappJoin(payload: IJoinGroupParam) {
        const { groupId, userId, plan, amount, paymentId, planId } = payload;
        const rateKey = `wa-${groupId}`;
        let instantAddition = 1;
        const rateRedis = await RedisManager.getCount(rateKey);
        if (rateRedis) {
            if (rateRedis.count > additionThreshhold) {
                instantAddition = 0;
            } else {
                const key = `wa-${groupId}-add`;
                const additionRate = await RedisManager.getCount(key);
                if (!additionRate) {
                    this.setCurrentTimeInRedis(key);
                } else {
                    const additionRateData = JSON.parse(additionRate);
                    const difference =
                        moment().unix() - additionRateData.startTime;
                    if (difference < additionRateDifference) {
                        instantAddition = 0;
                    }
                    if (difference >= additionRateDifference) {
                        this.setCurrentTimeInRedis(key);
                    }
                }
            }
        }
        let [groupDetails, primaryPhone] = await Promise.all([
            GroupDetailsRepository.findGroupById(groupId),
            instantAddition && phoneIdRepository.findActivePhone(groupId)
        ]);
        if (!primaryPhone) {
            primaryPhone =
                instantAddition &&
                (await phoneIdRepository.findNonprimaryPhone(groupId));
        }

        // const creatorData = await userRepository.findOneById(
        //     groupDetails.createdBy
        // );
        if (!groupDetails) {
            throw new Error(INVALID_GROUP);
        }
        const user = await userRepository.findOneById(userId);
        // const [user] = await Promise.all([
        //     userRepository.findOneById(userId),
        //     userRepository.findOneById(groupDetails.createdBy)
        // ]);
        if (!user) {
            throw new Error(TOKEN_INVALID);
        }

        if (!primaryPhone && instantAddition) {
            sendNotificationToGoogleChat(WHATSAPP_USER_ADDITION, {
                action: 'USER_ADDITION',
                data: {
                    mobile: user.mobile,
                    groupId
                },
                reason: 'No active Phone found, please assist and resolve'
            });
        }

        const isAlreadyJoined =
            await MemberGroupMapRepository.hasMemberJoinedGroup2(
                groupId,
                userId
            );
        console.log('ALREADY JOINED', isAlreadyJoined[0]);

        let member: any = {
            groupId: groupId,
            memberId: userId,
            joinedDate: new Date(),
            paymentId: paymentId,
            isActive: false,
            currentPlan: plan,
            groupName: groupDetails.groupName,
            isAdded: 0,
            status: 'pending',
            planId
        };

        // shifting group code block above

        const subscriptionPlan: IPricing = planId
            ? await GroupPlanRepository.findPlanById(planId)
            : JSON.parse(plan);
        console.log('SUB-2', subscriptionPlan);

        member.groupId = groupId;
        member.memberId = userId;
        console.log(
            `member log while joining group id -> ${member.groupId} `,
            member
        );

        // generate receipt
        this.sendMailWithInvoice(
            paymentId,
            {
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                state: user.state,
                manual: 1
            },

            amount,
            { groupName: groupDetails.groupName }
        );

        if (isAlreadyJoined[0] && isAlreadyJoined[0].isActive) {
            //  if not yet expired, just increase expiryDates
            if (subscriptionPlan.selectedPeriod !== 'Lifetime') {
                const days =
                    subscriptionPlan.selectedPeriod == 'Custom Period'
                        ? Common.CUSTOM_SUBSCRIPTION_MAPPING[
                              subscriptionPlan.customType
                          ] * subscriptionPlan.customValue
                        : Common.SUBSCRIPTION_MAPPING[
                              `${subscriptionPlan.selectedPeriod}`
                          ];
                console.log('DAYS', days);
                const earlierExpiry = isAlreadyJoined[0]
                    ? moment(isAlreadyJoined[0].expiryDate)
                    : moment();
                const earlierExpiryTimestamp = isAlreadyJoined[0]
                    ? moment(isAlreadyJoined[0].expiryTimestamp)
                    : moment();
                console.log('previous expiry', earlierExpiry);
                const expiryIsOld = moment().diff(earlierExpiry, 'days') > 0;
                console.log('isOld', expiryIsOld);

                member.expiryDate = !expiryIsOld
                    ? moment(earlierExpiry)
                          .add(days, 'days')
                          .format('YYYY-MM-DD')
                    : moment().add(days, 'days').format('YYYY-MM-DD');
                member.expiryTimestamp = !expiryIsOld
                    ? moment(earlierExpiryTimestamp)
                          .add(days, 'days')
                          .format('YYYY-MM-DD HH:mm:ss')
                    : moment().add(days, 'days').format('YYYY-MM-DD HH:mm:ss');
            }

            await Promise.all([
                memberGroupMap.updateGroupMemberStatus(member, 'success'),
                GroupDetailsRepository.updateGroupIncome(member, amount)
            ]);
            // if (
            //     isAlreadyJoined[0] &&
            //     !isAlreadyJoined[0].joinedBy &&
            //     isAlreadyJoined[0].inviteLink
            // ) {
            //     Group.sendSms(
            //         [user.mobile],
            //         user.id,
            //         undefined,
            //         groupId,
            //         {
            //             userName: user.name,
            //             inviteLink: encodeURIComponent(
            //                 encodeURIComponent(isAlreadyJoined[0].inviteLink)
            //             ),
            //             groupName: groupDetails.groupName
            //         },
            //         process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
            //         'memberAddition'
            //     );
            //     user.whatsappStatus &&
            //         isAlreadyJoined[0].inviteLink &&
            //         FreshchatService.sendJoiningLinkFreshchatServiceRequest(
            //             user.name,
            //             groupDetails.groupName,
            //             isAlreadyJoined[0].inviteLink.replace(
            //                 't.me',
            //                 'telegram.me'
            //             ),
            //             user.mobile
            //         );
            // }
        } else if (
            isAlreadyJoined[0] &&
            isAlreadyJoined[0].memberStatus == 'expired'
        ) {
            // add user to community or group

            let res;
            let finalStatus = 0;
            if (primaryPhone) {
                let data = JSON.stringify({
                    conversation_id: `${groupDetails.channelId}@g.us`,
                    number: `${user.mobile}@c.us`
                });

                res = await whatsappConfig.addToGroup(
                    data,
                    primaryPhone.phone.phoneId
                );
                console.log('whatsapp', res);
                // if (res && res.code == 'E01') {
                //     sendNotificationToGoogleChat(WHATSAPP_MANAGEMENT_URL, {
                //         action: 'USER_ADDITION',
                //         data: {
                //             mobile: user.mobile,
                //             groupId
                //         },
                //         reason: 'Number is not on whastapp'
                //     });
                // }
                if (
                    res &&
                    res.success &&
                    res.data &&
                    res.data.participants[0].code == 200
                ) {
                    member.status = 'success';
                    member.joinedBy = user.mobile;
                    member.isActive = 1;
                    member.joinedDate = new Date();
                    finalStatus = 1;
                    if (subscriptionPlan.selectedPeriod !== 'Lifetime') {
                        const days =
                            subscriptionPlan.selectedPeriod == 'Custom Period'
                                ? Common.CUSTOM_SUBSCRIPTION_MAPPING[
                                      subscriptionPlan.customType
                                  ] * subscriptionPlan.customValue
                                : Common.SUBSCRIPTION_MAPPING[
                                      `${subscriptionPlan.selectedPeriod}`
                                  ];
                        console.log('DAYS', days);
                        const earlierExpiry = isAlreadyJoined[0]
                            ? moment(isAlreadyJoined[0].expiryDate)
                            : moment();
                        const earlierExpiryTimestamp = isAlreadyJoined[0]
                            ? moment(isAlreadyJoined[0].expiryTimestamp)
                            : moment();
                        console.log('previous expiry', earlierExpiry);
                        const expiryIsOld =
                            moment().diff(earlierExpiry, 'days') > 0;
                        console.log('isOld', expiryIsOld);

                        member.expiryDate = !expiryIsOld
                            ? moment(earlierExpiry)
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD')
                            : moment().add(days, 'days').format('YYYY-MM-DD');
                        member.expiryTimestamp = !expiryIsOld
                            ? moment(earlierExpiryTimestamp)
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD HH:mm:ss')
                            : moment()
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD HH:mm:ss');
                    }
                    freshchatService.sendWAuserAdditionFreshchatServiceRequest(
                        groupDetails.groupName,
                        groupDetails.type.slice(8),
                        user.mobile,
                        groupId
                    );
                }
                // else if (
                //     res &&
                //     res.success &&
                //     res.data &&
                //     res.data.participants[0].code == 403
                // ) {
                //     sendNotificationToGoogleChat(WHATSAPP_MANAGEMENT_URL, {
                //         action: 'USER_ADDITION',
                //         data: {
                //             mobile: user.mobile,
                //             groupId
                //         },
                //         reason: 'Users privacy is enabled, please ask to switch to everyone in settings'
                //     });
                // }
                else if (res && res.code == 'W05') {
                    phoneIdRepository.updateGroupPhoneMap(
                        { isActive: 0 },
                        { id: primaryPhone.id }
                    );
                    phoneIdRepository.updatePhone(
                        { isActive: 0 },
                        { id: primaryPhone.phone.id }
                    );
                    sendNotificationToGoogleChat(WHATSAPP_USER_ADDITION, {
                        action: 'USER_ADDITION',
                        data: {
                            phone: primaryPhone.phone.phone,
                            phoneId: primaryPhone.phone.phoneId
                        },
                        reason: 'BUSINESS NUMBER IS DEACTIVATED FROM MAYTAPI, PLEASE CHECK'
                    });
                }
            }

            member['inviteLink'] = '';

            await Promise.all([
                memberGroupMap.updateGroupMemberStatus(
                    {
                        ...member,
                        memberStatus: 'renewed'
                    },
                    finalStatus ? 'success' : 'pending'
                ),
                GroupDetailsRepository.updateGroupIncome(member, amount)
            ]);
        }

        // new joinee

        if (isAlreadyJoined.length <= 0) {
            if (primaryPhone) {
                let data = JSON.stringify({
                    conversation_id: `${groupDetails.channelId}@g.us`,
                    number: `${user.mobile}@c.us`
                });

                const res = await whatsappConfig.addToGroup(
                    data,
                    primaryPhone.phone.phoneId
                );
                console.log('whatsapp', res, res.data);
                // if (res && res.code == 'E01') {
                //     sendNotificationToGoogleChat(WHATSAPP_MANAGEMENT_URL, {
                //         action: 'USER_ADDITION',
                //         data: {
                //             mobile: user.mobile,
                //             groupId
                //         },
                //         reason: 'Number is not on whastapp'
                //     });
                // }
                if (
                    res &&
                    res.success &&
                    res.data &&
                    res.data.participants[0].code == 200
                ) {
                    member.status = 'success';
                    member.joinedBy = user.mobile;
                    member.isActive = 1;
                    member.joinedDate = new Date();
                    if (subscriptionPlan.selectedPeriod !== 'Lifetime') {
                        const days =
                            subscriptionPlan.selectedPeriod == 'Custom Period'
                                ? Common.CUSTOM_SUBSCRIPTION_MAPPING[
                                      subscriptionPlan.customType
                                  ] * subscriptionPlan.customValue
                                : Common.SUBSCRIPTION_MAPPING[
                                      `${subscriptionPlan.selectedPeriod}`
                                  ];
                        console.log('DAYS', days);
                        const earlierExpiry = isAlreadyJoined[0]
                            ? moment(isAlreadyJoined[0].expiryDate)
                            : moment();
                        const earlierExpiryTimestamp = isAlreadyJoined[0]
                            ? moment(isAlreadyJoined[0].expiryTimestamp)
                            : moment();
                        console.log('previous expiry', earlierExpiry);
                        const expiryIsOld =
                            moment().diff(earlierExpiry, 'days') > 0;
                        console.log('isOld', expiryIsOld);

                        member.expiryDate = !expiryIsOld
                            ? moment(earlierExpiry)
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD')
                            : moment().add(days, 'days').format('YYYY-MM-DD');
                        member.expiryTimestamp = !expiryIsOld
                            ? moment(earlierExpiryTimestamp)
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD HH:mm:ss')
                            : moment()
                                  .add(days, 'days')
                                  .format('YYYY-MM-DD HH:mm:ss');
                    }
                    freshchatService.sendWAuserAdditionFreshchatServiceRequest(
                        groupDetails.groupName,
                        groupDetails.type.slice(8),
                        user.mobile,
                        groupId
                    );
                }
                // else if (
                //     res &&
                //     res.success &&
                //     res.data &&
                //     res.data.participants[0].code == 403
                // ) {
                //     sendNotificationToGoogleChat(WHATSAPP_MANAGEMENT_URL, {
                //         action: 'USER_ADDITION',
                //         data: {
                //             mobile: user.mobile,
                //             groupId
                //         },
                //         reason: 'Users privacy is enabled, please ask to switch to everyone in settings'
                //     });
                // }
                else if (res && res.code == 'W05') {
                    phoneIdRepository.updateGroupPhoneMap(
                        { isActive: 0 },
                        { id: primaryPhone.id }
                    );
                    phoneIdRepository.updatePhone(
                        { isActive: 0 },
                        { id: primaryPhone.phone.id }
                    );
                    sendNotificationToGoogleChat(WHATSAPP_USER_ADDITION, {
                        action: 'USER_ADDITION',
                        data: {
                            phone: primaryPhone.phone.phone,
                            phoneId: primaryPhone.phone.phoneId
                        },
                        reason: 'BUSINESS NUMBER IS DEACTIVATED FROM MAYTAPI, PLEASE CHECK'
                    });
                }
            }
            member['inviteLink'] = '';
            await GroupDetailsRepository.joinGroup(
                {
                    ...member,
                    memberStatus: 'renewed'
                },
                amount
            );

            // member.inviteLink &&
            //     Group.sendSms(
            //         [user.mobile],
            //         user.id,
            //         undefined,
            //         groupId,
            //         {
            //             userName: user.name,
            //             inviteLink: encodeURIComponent(
            //                 encodeURIComponent(member.inviteLink)
            //             ),
            //             groupName: groupDetails.groupName
            //         },
            //         process.env.COMM_ACCESS_SMS_CUSTOMER_ADDITION,
            //         'memberAddition'
            //     );
            // user.email &&
            //     member.inviteLink &&
            //     this.sendMailWithInvoice(
            //         paymentId,
            //         user,

            //         amount,
            //         emailTemplateData
            //     );
            // user.whatsappStatus &&
            //     member.inviteLink &&
            //     FreshchatService.sendJoiningLinkFreshchatServiceRequest(
            //         user.name,
            //         groupDetails.groupName,
            //         member.inviteLink.replace('t.me', 'telegram.me'),
            //         user.mobile
            //     );
            // member.inviteLink &&
            //     RedisManager.addToHashmap(member.inviteLink, {
            //         groupName: groupDetails.groupName,
            //         name: user.name,
            //         mobile: user.mobile,
            //         groupId,
            //         userId: user.id,
            //         type: 'member',
            //         token: botToken.botToken.token,
            //         currentPlan: plan,
            //         status: 'pending',
            //         planId: planId || 0
            //     });
        }

        // try {
        //     // call publisher here
        //     // if (parseInt(process.env.IS_PUBSUB_ENABLED)) {
        //     //     PubSubService.sendMessage(
        //     //         {
        //     //             telegramPayload: telegramPayload,
        //     //             member: member
        //     //         },
        //     //         process.env.PUBSUB_TELEGRAM_TOPIC2,
        //     //         {
        //     //             type: 'customerAdded'
        //     //         }
        //     //     );
        //     // }
        //     await Telegram.addUserToChannel(telegramPayload);
        // } catch (error) {
        //     // memeber group mapping entry with new status column  and error meesgae
        //     member['isAdded'] = 0;
        //     member['errorMsg'] = error;
        // }
        // end telegram
    }

    addUserToGroupCallback = async (payload: any) => {
        console.log('ADD Group', payload);
        const response = await Telegram.addUserToChannel(
            payload.telegramPayload,
            undefined,
            payload.session
        );
        if (!response) {
            return;
        }
        // update member_group_mapping
        const member = payload.member;
        // perform update operation
        console.log('AFTER SUB', member);
        await memberGroupMap.updateGroupMemberStatus(member, 'success');
    };

    async getGroupDetails(data, auth = true) {
        let groupDetails: any = await GroupDetailsRepository.findGroupById(
            data.groupId
        );
        if (!groupDetails) {
            return new ResponseBuilder(400, {}, ERROR_400);
        }
        // console.log({ auth });
        groupDetails.subscriptionPlan = groupDetails.subscriptionPlan
            ? JSON.parse(groupDetails.subscriptionPlan)
            : {};
        if (!auth) {
            delete groupDetails.channelHash;
            delete groupDetails.totalRevenue;
            delete groupDetails.channelId;
            return new ResponseBuilder(200, groupDetails, SUCCESS_200);
        }
        if (groupDetails.createdBy == data.user.id) {
            const activeCounts = await MemberGroupMapRepository.membersCount(
                data.groupId
            );
            groupDetails.members = activeCounts;
        }
        groupDetails.paymentLink = `${process.env.PAYMENT_DOMAIN}/g/${groupDetails.id}`;
        groupDetails.shareLinks = await Group.links(
            groupDetails.id,
            groupDetails.groupName,
            groupDetails.about
        );

        groupDetails.inviteLink = groupDetails.inviteLink
            ? groupDetails.inviteLink.replace('t.me', 'telegram.me')
            : null;

        const memberCount = await paymentRepository.getTotalPurchases(
            groupDetails.id
        );

        groupDetails.memberCount = memberCount;

        return new ResponseBuilder(200, groupDetails, SUCCESS_200);
    }

    async updateGroup(
        groupId: number,
        userId: number,
        data: IPricing[],
        title?: string,
        description?: string
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
            description
        );
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
        return new ResponseBuilder(200, result, SUCCESSFULLY_UPDATED);
    }

    // ONLY FOR TESTING
    async addUserToChannel(payload: any) {
        const res1 = await GroupDetailsRepository.list({ id: 2 }, {});
        payload = {
            channelId: res1[0].channelId,
            channelHash: res1[0].channelHash
        };
        const resp: any = await Telegram.addUserToChannel(payload);
        return resp;
    }

    async stats(filter: IAllListMember, userId) {
        let statDetails = {
            members: [],
            totalRevenue: 0
        };
        filter.userId = userId;
        filter.limit = filter.limit ? Number(filter.limit) : 10;
        filter.offset = filter.offset ? Number(filter.offset) : 0;
        let [groupDetails, groupIds]: any = await Promise.all([
            GroupDetailsRepository.allGroups(filter.userId),
            GroupDetailsRepository.allCreatedGroupIds(filter.userId)
        ]);
        statDetails.totalRevenue =
            groupDetails && groupDetails.length ? groupDetails[0].total : 0;
        filter.groupIds = _.pluck(groupIds || [], 'id');
        if (filter.groupIds.length) {
            statDetails.members = await MemberGroupMapRepository.listAll2(
                filter
            );
            statDetails.members = statDetails.members.map((memObj) => {
                // let currentPlan;
                // console.log(currentPlan);
                // try {
                //     currentPlan = JSON.parse(memObj.currentPlan);
                // } catch (error) {
                //     console.log('error in parsing current plan :: ', memObj);
                // }
                // let revenue = 0;
                // if (currentPlan.paymentPeriod) {
                //     revenue = currentPlan.paymentPeriod.price;
                // } else {
                //     revenue = currentPlan.accessPrice;
                // }
                memObj.revenue = memObj.amount;
                return memObj;
            });
        }
        return new ResponseBuilder(200, statDetails, SUCCESSFULLY_LISTED);
    }

    async removeFromGroup() {
        try {
            await RedisManager.incrCount('RemoveUsers');
            const removalBotTokens = await BotToken.findAll({
                where: {
                    type: { [Op.or]: ['removal', 'automate'] }
                }
            });
            await Promise.allSettled(
                removalBotTokens.map((index) =>
                    this.removeFromGroupByToken(index.id, 10)
                )
            );
            await RedisManager.decrCount('RemoveUsers');
            return true;
        } catch (error) {
            console.error(error);
            return true;
        }
    }

    async removeFromGroupByToken(botToken: number, limit: number) {
        try {
            const actualExpiredMemebers = [];
            const expiredUsers = await MemberGroupMapRepository.membersExpired({
                botToken: botToken,
                limit: limit
            });
            console.log(
                'users to be expired via bot -',
                botToken,
                'are',
                expiredUsers
            );
            if (!expiredUsers || !expiredUsers.length) {
                return true;
            }

            for (const user of expiredUsers) {
                const botTokenPrimary = await groupBotRepository.findOne({
                    groupId: user.groupId,
                    isActive: 1,
                    isPrimary: 1
                });
                if (!botTokenPrimary) {
                    continue;
                }
                const removalBotToken = await BotToken.findOne({
                    where: {
                        id: botToken
                    }
                });

                if (
                    !user.channelId ||
                    !botTokenPrimary ||
                    !botTokenPrimary.botToken.token
                ) {
                    sendNotificationToGoogleChat(REMOVAL_CHAT_URL, {
                        source: 'ABORTING REMOVE FROM CHANNEL',
                        data: {
                            telegramUserId: user.joinedBy,
                            channelId: user.channelId,
                            token: botTokenPrimary.botToken.token
                        }
                    });
                    console.log('Aborting user removal', user);
                    continue;
                }
                if (user.joinedBy) {
                    RedisManager.setMember(
                        `-100${user.channelId}-${user.joinedBy}`,
                        1
                    );

                    // RedisManager.expireKey(
                    //     `-100${user.channelId}-${user.joinedBy}`,
                    //     30
                    // );

                    const banUser = await Telegram.banChatMemberViaBot(
                        user.joinedBy,
                        user.channelId,
                        removalBotToken.token
                    );

                    await Telegram.sleep(2000);
                    const unbanUser = await Telegram.unbanChatMemberViaBot(
                        user.joinedBy,
                        user.channelId,
                        removalBotToken.token
                    );
                    if (!banUser && !unbanUser) {
                        continue;
                    }
                    console.log('userBan', banUser, unbanUser, user.memberId);
                }
                if (user.inviteLink) {
                    await Telegram.sleep(2000);
                    await Telegram.revokeLinkViaBot(
                        botTokenPrimary.botToken.token,
                        user.inviteLink,
                        user.channelId
                    );
                }

                actualExpiredMemebers.push(user.mgmId);

                const encryptMember = await this.getEncryptedmember(
                    String(user.memberId)
                );
                const encryptGroup = await this.getEncryptedGroup(
                    String(user.groupId)
                );
                if (user.isReminderEnabled) {
                    await Group.sendSms(
                        [user.mobile],
                        user.id,
                        undefined,
                        user.groupId,
                        {
                            userName: user.userName,
                            groupName: user.channelName,
                            adminName: user.adminName,
                            paymentLink: `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`
                        },
                        process.env.COMM_ACCESS_SMS_SUBSCRIPTION_EXPIRED,
                        'subscriptionExpired'
                    );
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

                    if (user.whatsappStatus) {
                        FreshchatService.sendPlanExpiryFreshchatServiceRequest(
                            user.userName,
                            user.channelName,
                            `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`,
                            user.mobile,
                            user.groupId
                        );
                    }
                }

                await Telegram.sleep(6000);
            }
            await MemberGroupMapRepository.updateActiveStatus(
                { id: actualExpiredMemebers },
                0
            );
            sendNotificationToGoogleChat(REMOVAL_CHAT_URL, {
                source: 'REMOVE FROM CHANNEL',
                data: {
                    botToken: botToken,
                    totalMemberLimitTobeRemoved: limit,
                    actualRemovedUsers: actualExpiredMemebers.length
                }
            });
            return true;
        } catch (error) {
            console.error(error);
            return true;
        }
    }

    async createGroup() {
        try {
            const pendingGroups: any = await sequelize.query(
                `
				SELECT * FROM group_details WHERE status='pending' AND inviteLink is NULL AND type='telegramChannel' ORDER BY createdAt DESC LIMIT 10;`,
                { type: QueryTypes.SELECT }
            );
            console.log('Pending Groups', pendingGroups);

            for (const value of pendingGroups) {
                try {
                    const userObj = await userRepository.findOneById(
                        value.createdBy
                    );

                    if (!userObj) {
                        continue;
                    }

                    // if (!userObj.telegramUserId) {
                    //     const telegramUserRes: any =
                    //         await Telegram.checkAndUpdateUser(userObj);
                    //     if (
                    //         !telegramUserRes &&
                    //         !telegramUserRes.telegramUserId
                    //     ) {
                    //         continue;
                    //     }
                    //     userObj.telegramUserId = telegramUserRes.telegramUserId;
                    //     userObj.telegramAccessHash =
                    //         telegramUserRes.telegramAccessHash;
                    // }

                    let payload: any = {};
                    payload['name'] = value.groupName;
                    payload['about'] = value.about;
                    payload['userObj'] = userObj;
                    payload['groupId'] = value.id;
                    payload['channelId'] = value.channelId;
                    payload['channelHash'] = value.channelHash;
                    payload['sessionId'] = value.sessionId;
                    const result = await Telegram.createChannel(
                        payload,
                        undefined,
                        'group'
                    );
                    // TODO: payload chat check
                    if (result && result.channel) {
                        await Promise.all([
                            GroupDetailsRepository.updateGroup(
                                payload.groupId,
                                userObj.id,
                                undefined,
                                undefined,
                                result.channel.channelId,
                                result.channel.channelHash,
                                'pending',
                                result.session.id,
                                result.inviteLink || null
                            ),
                            !result.secondaryBot &&
                                !value.sessionId &&
                                GroupBotMapRepository.createGroupBotMap({
                                    isActive: 1,
                                    isPrimary: 1,
                                    groupId: payload.groupId,
                                    botTokenId: result.botToken
                                })
                        ]);
                    }
                    result.inviteLink &&
                        (await RedisManager.addToHashmap(result.inviteLink, {
                            groupName: value.groupName,
                            name: userObj.name,
                            mobile: userObj.mobile,
                            groupId: value.id,
                            userId: userObj.id,
                            type: 'group',
                            token: result.token,
                            conditionalApproval: value.conditionalApproval
                        }));

                    result.inviteLink &&
                        RedisManager.expireKey(
                            result.inviteLink,
                            7 * 24 * 60 * 60
                        );
                    await Telegram.sleep(15000);
                } catch (err) {
                    console.log('err in create group cron', err.message);
                }
            }
            return;
        } catch (error) {
            console.error(error);
        }
    }

    async createBackupGroup() {
        try {
            const groupTokens: any = await sequelize.query(
                `
				SELECT sessionId, COUNT(group_details.id) as count FROM group_details JOIN session_token ON session_token.id=sessionId WHERE session_token.isActive=1 AND group_details.type IN ('telegramExisting', 'telegramChannel') GROUP BY (sessionId);`,
                { type: QueryTypes.SELECT }
            );
            for (const g of groupTokens) {
                if (g.count > 470) {
                    await sessionToken.updateSession({ id: g.sessionId });
                    sendNotificationToGoogleChat(TOKEN_CHAT_URL, {
                        source: 'TOKEN_LIMIT_REACHED',
                        context: { action: 'PREGROUP_CREATE' },
                        stats: JSON.stringify(g)
                    });
                }
            }

            // TODO: put a smart logic to check load and then create if necessary
            const readyGroups: any = await sequelize.query(
                `
            		SELECT * FROM group_details WHERE status='ready' AND type IN ('telegramExisting', 'telegramChannel');`,
                { type: QueryTypes.SELECT }
            );
            if (readyGroups.length >= 20) {
                return;
            }

            for (let i = 0; i < 20 - readyGroups.length; i++) {
                try {
                    let group: IGroup = {
                        groupName: 'backup sample',
                        about: 'backup about',
                        subscriptionPlan: JSON.stringify({}),
                        createdBy: 307,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        channelId: 0,
                        channelHash: '',
                        status: 'inprocess',
                        category: 'sample',
                        type: 'telegramChannel'
                    };

                    console.log('group', group);
                    let payload: any = {};
                    payload['name'] = group.groupName;
                    payload['about'] = group.about;
                    payload['userObj'] = { id: group.createdBy };
                    // payload['groupId'] = group.id;
                    const result = await Telegram.createChannel(
                        payload,
                        undefined,
                        'group',
                        true,
                        false
                    );
                    console.log(
                        'backup create channel done',
                        result.channel.channelId
                    );

                    if (result && result.channel) {
                        console.log('SESSION_RES', result.session),
                            (group.channelId = result.channel.channelId);
                        group.channelHash = result.channel.channelHash;
                        group.status = 'inprocess';
                        group.sesssionId = result.session.id;
                        group.inviteLink = result.inviteLink;

                        const groupDetails =
                            await GroupDetailsRepository.addGroup(group);
                        await GroupBotMapRepository.createGroupBotMap({
                            isActive: 1,
                            isPrimary: 1,
                            groupId: groupDetails.id,
                            botTokenId: result.botToken
                        });
                    }
                    await Telegram.sleep(10000);
                } catch (err) {
                    console.log('err in create group cron', err.message);
                }
            }

            // TODO: old inprocess operation

            // const pendingGroups: any = await sequelize.query(
            //     `
            // 		SELECT * FROM group_details WHERE status='inprocess' AND inviteLink is NULL ORDER BY createdAt ASC LIMIT 20;`,
            //     { type: QueryTypes.SELECT }
            // );
            // console.log('Pending Inprocess Groups', pendingGroups);

            // for (const value of pendingGroups) {
            //     try {
            //         const userObj = await userRepository.findOneById(
            //             value.createdBy
            //         );

            //         if (!userObj) {
            //             continue;
            //         }

            //         let payload: any = {};
            //         payload['name'] = value.groupName;
            //         payload['about'] = value.about;
            //         payload['userObj'] = userObj;
            //         payload['groupId'] = value.id;
            //         payload['channelId'] = value.channelId;
            //         payload['channelHash'] = value.channelHash;
            //         payload['sessionId'] = value.sessionId;
            //         const result = await Telegram.createChannel(
            //             payload,
            //             undefined,
            //             'group',
            //             true
            //         );
            //         // TODO: payload chat check
            //         if (result && result.channel) {
            //             await Promise.all([
            //                 GroupDetailsRepository.updateGroup(
            //                     payload.groupId,
            //                     userObj.id,
            //                     undefined,
            //                     undefined,
            //                     result.channel.channelId,
            //                     result.channel.channelHash,
            //                     'inprocess',
            //                     result.session.id,
            //                     null
            //                 ),
            //                 result.inviteLink
            //                     ? GroupBotMapRepository.createGroupBotMap({
            //                           isActive: 1,
            //                           isPrimary: 1,
            //                           groupId: payload.groupId,
            //                           botTokenId: result.botToken
            //                       })
            //                     : undefined
            //             ]);
            //         }
            //         await Telegram.sleep(10000);
            //     } catch (err) {
            //         console.log(err.message);
            //     }
            // }

            // TODO: OLD ends

            const stats: any = await sequelize.query(
                `
				SELECT sessionId, COUNT(group_details.id) FROM group_details JOIN session_token ON session_token.id=sessionId WHERE session_token.isActive=1 AND group_details.type IN ('telegramExisting', 'telegramChannel')  GROUP BY (sessionId);`,
                { type: QueryTypes.SELECT }
            );
            console.log('STATS', stats);
            process.env.NODE_ENV === 'production' &&
                sendNotificationToGoogleChat(TOKEN_CHAT_URL, {
                    source: 'TOKEN_STATS',
                    context: { action: 'PREGROUP_CREATE' },
                    stats: JSON.stringify(stats)
                });

            return;
        } catch (error) {
            console.error(error);
        }
    }

    async addBotToBackupGroup() {
        try {
            // TODO: put a smart logic to check load and then create if necessary

            const pendingGroups: any = await sequelize.query(
                `
				SELECT * FROM group_details  WHERE status='inprocess' AND type IN ('telegramExisting', 'telegramChannel');`,
                { type: QueryTypes.SELECT }
            );
            console.log(
                'Second bot to be added Inprocess Groups',
                pendingGroups
            );

            for (const value of pendingGroups) {
                try {
                    const userObj = await userRepository.findOneById(
                        value.createdBy
                    );

                    if (!userObj) {
                        continue;
                    }

                    let payload: any = {};
                    payload['name'] = value.groupName;
                    payload['about'] = value.about;
                    payload['userObj'] = userObj;
                    payload['groupId'] = value.id;
                    payload['channelId'] = value.channelId;
                    payload['channelHash'] = value.channelHash;
                    payload['sessionId'] = value.sessionId;
                    payload['inviteLink'] = value.inviteLink;
                    const result = await Telegram.createChannel(
                        payload,
                        undefined,
                        'group',
                        false,
                        true
                    );
                    // TODO: payload chat check
                    if (result && result.channel) {
                        await Promise.all([
                            GroupDetailsRepository.updateGroup(
                                payload.groupId,
                                userObj.id,
                                undefined,
                                undefined,
                                result.channel.channelId,
                                result.channel.channelHash,
                                result.inviteLink ? 'ready' : 'inprocess',
                                result.session.id,
                                result.inviteLink || null
                            ),
                            result.secondaryBot
                                ? GroupBotMapRepository.updateGroupBotMap(
                                      { isActive: result.inviteLink ? 1 : 0 },
                                      {
                                          groupId: payload.groupId,
                                          botTokenId: result.botToken
                                      }
                                  )
                                : GroupBotMapRepository.createGroupBotMap({
                                      isActive: result.inviteLink ? 1 : 0,
                                      isPrimary: 0,
                                      groupId: payload.groupId,
                                      botTokenId: result.botToken
                                  })
                        ]);
                    }
                    await Telegram.sleep(10000);
                } catch (err) {
                    console.log(err.message);
                }
            }

            return;
        } catch (error) {
            console.error(error);
        }
    }

    async addRemovalBotToBackupGroup() {
        try {
            const pendingGroups: any = await sequelize.query(
                `
				SELECT * FROM group_details WHERE removalBotStatus=0 AND type IN ('telegramExisting', 'telegramChannel') ORDER BY createdAt DESC LIMIT 20`,
                { type: QueryTypes.SELECT }
            );
            console.log('REMOVAL bot to be added in Groups', pendingGroups);

            for (const value of pendingGroups) {
                try {
                    let payload: any = {};

                    payload['groupId'] = value.id;
                    payload['channelId'] = value.channelId;

                    payload['sessionId'] = value.sessionId;

                    const result = await Telegram.addRemovalBotInChannel(
                        payload,

                        'removal'
                    );
                    // TODO: payload chat check
                    if (result && result.botId) {
                        await Promise.all([
                            GroupDetailsRepository.updateGroupByFiter(
                                { id: value.id },
                                { removalBotStatus: 1 }
                            ),

                            GroupBotMapRepository.createGroupBotMap({
                                isActive: 1,
                                isPrimary: 2,
                                groupId: payload.groupId,
                                botTokenId: result.botId
                            })
                        ]);
                    }
                    await Telegram.sleep(10000);
                } catch (err) {
                    console.log(err.message);
                }
            }

            return;
        } catch (error) {
            console.error(error);
        }
    }

    async replaceBots() {
        try {
            const pendingGroups: any = await sequelize.query(
                `
				SELECT channelId, sessionId, gd.id FROM group_details gd JOIN group_bot_map gbm ON gbm.groupId=gd.id AND gd.sessionId <> 40 AND gbm.isPrimary=0 AND gbm.botTokenId IN (6,7,8) AND groupId NOT IN (SELECT groupId FROM group_bot_map WHERE isPrimary=0 AND botTokenId IN (39,40,41)) LIMIT 10 ;`,
                { type: QueryTypes.SELECT }
            );
            console.log('replacement bot to be added in Groups', pendingGroups);

            for (const value of pendingGroups) {
                try {
                    let payload: any = {};

                    payload['groupId'] = value.id;
                    payload['channelId'] = value.channelId;

                    payload['sessionId'] = value.sessionId;

                    const result = await Telegram.addListenerBotInChannel(
                        payload,

                        'group'
                    );
                    // TODO: payload chat check
                    if (result && result.botId) {
                        await Promise.all([
                            GroupBotMapRepository.createGroupBotMap({
                                isActive: 1,
                                isPrimary: 0,
                                groupId: payload.groupId,
                                botTokenId: result.botId
                            })
                        ]);
                    }
                    await Telegram.sleep(10000);
                } catch (err) {
                    console.log(err.message);
                }
            }

            return;
        } catch (error) {
            console.error(error);
        }
    }

    async checkAdminStatus() {
        try {
            const pendingGroups: any = await sequelize.query(
                `
				SELECT gd.id, u.telegramAccessHash, gd.createdBy, gd.updatedAt, gd.inviteLink,  u.telegramUserId, u.mobile, u.id as userId, gd.channelHash, gd.channelId
				from  group_details gd 
				INNER JOIN users u ON u.id = gd.createdBy 
				WHERE gd.status='pending' AND gd.sessionId IS NOT NULL AND gd.inviteLink IS NOT NULL AND gd.type='telegramChannel' ORDER BY gd.createdAt DESC limit 20`,
                { type: QueryTypes.SELECT }
            );
            console.log('Pending Groups admins', pendingGroups);
            await RedisManager.incrCount('checkCreator');
            for (const value of pendingGroups) {
                try {
                    console.log('Pending group', value);
                    const userObj = await userRepository.findOneById(
                        value.createdBy
                    );

                    if (!userObj) {
                        continue;
                    }

                    // if (!userObj.telegramUserId) {
                    //     const telegramUserRes: any =
                    //         await Telegram.checkAndUpdateUser(userObj);

                    //     if (!telegramUserRes && !telegramUserRes.id) {
                    //         continue;
                    //     }
                    //     userObj.telegramUserId = telegramUserRes.id;
                    //     userObj.telegramAccessHash = telegramUserRes.accessHash;
                    // }

                    const payload = {
                        channelId: value.channelId,
                        channelHash: value.channelHash,
                        telegramUserId: value.telegramUserId,
                        telegramAccessHash: value.telegramAccessHash,
                        mobile: value.mobile,
                        id: value.userId,
                        inviteLink: value.inviteLink,
                        updatedAt: value.updatedAt,
                        groupId: value.id
                    };
                    const result = await Telegram.findAdminAndUpdateAdminRights(
                        payload,
                        // undefined,
                        // {
                        //     session: value.session,
                        //     apiId: value.apiId,
                        //     apiHash: value.apiHash
                        // },
                        true
                    );
                    if (!result) {
                        console.log('failed to add creator as admin**********');
                        await Telegram.sleep(20000);
                        continue;
                    }

                    await Promise.all([
                        Group.sendSms(
                            [userObj.mobile],
                            userObj.id,
                            undefined,
                            value.id,
                            {
                                adminName: userObj.name,
                                channelName: value.groupName
                            },
                            process.env.COMM_ACCESS_SMS_ADMIN_RIGHTS,
                            'adminRights'
                        ),

                        // update in db with success status
                        GroupDetailsRepository.updateGroupStatus(
                            value.id,
                            userObj.id,
                            { status: 'success' }
                        )
                    ]);

                    await Telegram.sleep(2000);
                } catch (err) {
                    console.log(
                        `err in updating admin of ${value.id}`,
                        err.message
                    );
                }
            }
            await RedisManager.decrCount('checkCreator');

            await Telegram.sleep(10000);
            return true;
        } catch (error) {
            console.error(error);
        }
    }

    async createGroupInviteLinks(groupIds?: number[], limit1?: number) {
        console.log(groupIds);
        try {
            let pendingGroups: any;
            if (groupIds && groupIds.length) {
                pendingGroups = await sequelize.query(
                    {
                        query: `
					SELECT gd.channelId, gd.id, gd.conditionalApproval, bt.token, gbm.botTokenId FROM group_details gd JOIN group_bot_map gbm ON gbm.groupId = gd.id JOIN bot_token bt ON bt.id=gbm.botTokenId  WHERE status='success' AND gbm.isPrimary=1 AND gd.id IN (?)`,
                        values: [groupIds]
                    },
                    {
                        raw: true,
                        nest: true
                    }
                );
            } else {
                pendingGroups = await sequelize.query(
                    `
					SELECT gd.channelId, gd.id, gd.conditionalApproval, bt.token, gbm.botTokenId FROM group_details gd JOIN group_bot_map gbm ON gbm.groupId = gd.id JOIN bot_token bt ON bt.id=gbm.botTokenId  WHERE status='success' AND gbm.isPrimary=1 ORDER BY gd.createdAt DESC LIMIT 10;`,
                    { type: QueryTypes.SELECT }
                );
            }

            console.log('Groups links', pendingGroups);

            const uniqueGroups = [];
            for (const group of pendingGroups) {
                if (uniqueGroups.length == 0) {
                    uniqueGroups.push(group);
                    continue;
                }
                let x = uniqueGroups.find(
                    (value) => value.botTokenId === group.botTokenId
                );
                if (!x) {
                    uniqueGroups.push(group);
                }
            }

            console.log('Groups links', uniqueGroups);

            uniqueGroups.forEach(async (value) => {
                try {
                    const unused = await RedisManager.getMembersFromSet(
                        String(value.id)
                    );
                    console.log('UNUSED', value.id, unused.length);

                    // if (unused.length >= limit1) {
                    //     return;
                    // }

                    // const limit = limit1 || 20 - unused.length;
                    const limit = limit1 || 20;
                    const links = [];
                    if (limit <= 0) {
                        return;
                    }
                    //
                    for (let i = 0; i < limit; i++) {
                        const link = await Telegram.createInviteLinkBot(
                            value.channelId,
                            value.token,
                            false,
                            value.conditionalApproval
                        );
                        link && links.push(link);
                        await Telegram.sleep(2000);
                    }

                    links.length > 0 &&
                        (await RedisManager.addToSet(String(value.id), links));
                } catch (err) {
                    console.log(err.message);
                }
            });
            return;
        } catch (error) {
            console.error(error);
        }
    }

    async updateGroupAndNotify(
        userId,
        mobile,
        groupId,
        name,
        groupName,
        tgUserId
    ) {
        await Promise.all([
            Group.sendSms(
                [mobile],
                userId,
                undefined,
                groupId,
                {
                    adminName: name,
                    channelName: groupName
                },
                process.env.COMM_ACCESS_SMS_ADMIN_RIGHTS,
                'adminRights'
            ),

            // update in db with success status
            GroupDetailsRepository.updateGroupStatus(groupId, userId, {
                status: 'success',
                joinedBy: tgUserId
            })
        ]);
    }

    async createMigrationMemberMapping(payload: any) {
        try {
            const group = await GroupDetailsRepository.findGroupById(
                payload.groupId
            );
            let total = 0;
            let members = 0;
            const response = {
                totalMembers: payload.membersData.length,
                actualAddedMembers: 0
            };

            const subscriptionPlan = JSON.parse(group.subscriptionPlan);
            console.log(group.id);
            for (let i = 0; i < payload.membersData.length; i++) {
                const joiningDate = moment(payload.membersData[i].joiningDate);

                const expiryDate = payload.membersData[i].expiryDate
                    ? moment(payload.membersData[i].expiryDate)
                    : null;

                const differenceInDays =
                    expiryDate && expiryDate.diff(joiningDate, 'days');

                console.log(
                    'joining',
                    joiningDate,
                    expiryDate,
                    differenceInDays
                );

                const period =
                    Common.DAYS_SUBSCRIPTION_MAPPING[differenceInDays];

                console.log('DAYS', period);
                const myPlan =
                    period &&
                    subscriptionPlan.find(
                        (plan) => plan.selectedPeriod === period
                    );
                console.log('myPlan', myPlan);

                const userObj = await userRepository.findOrCreateByNumber(
                    payload.membersData[i]
                );
                console.log('userObj', userObj.user.id);
                if (!userObj.user) {
                    continue;
                    // return new ResponseBuilder(400, {}, ERROR_400);
                }

                const payment = await paymentRepository.findOrCreatePayment({
                    buyerId: userObj.user.id,
                    sellerId: group.createdBy,
                    migrated: 1,
                    groupId: group.id,
                    amount: Number(payload.membersData[i].amount),
                    orderType: 'group',
                    currentPlan: (myPlan && JSON.stringify(myPlan)) || '',
                    orderId: '',
                    status: 'success',
                    fankonnnectComission:
                        Number(payload.membersData[i].classplusShare) || 0
                });

                await MemberGroupMapRepository.findOrCreateMemberGroupMap({
                    memberId: userObj.user.id,
                    groupId: group.id,
                    paymentId: payment.payment.id,
                    expiryTimestamp: expiryDate
                        ? expiryDate.format('YYYY-MM-DD HH:mm:ss')
                        : null,
                    currentPlan: (myPlan && JSON.stringify(myPlan)) || '',
                    isAdded: 1,
                    status: 'migrating',
                    expiryDate: expiryDate
                        ? expiryDate.format('YYYY-MM-DD')
                        : null,
                    groupName: group.groupName,
                    joinedDate: joiningDate.format('YYYY-MM-DD HH:mm:ss')
                });
                total += Number(payload.membersData[i].amount);
                members += 1;
                response.actualAddedMembers += 1;
            }
            await GroupDetailsRepository.updateGroupIncomeFix(
                group.id,
                total,
                members
            );
            return new ResponseBuilder(200, response, SUCCESSFULLY_UPDATED);
        } catch (err) {
            console.log(err);
        }
    }

    async editTgChannel(titleOptions: any) {
        axios.request(titleOptions);
        await telegram.sleep(2000);
        // axios.request(aboutOptions);
    }

    async getPreAuthGroupData(data: any) {
        try {
            console.log(data);
            const [encryptedMember, encryptedGroup] = await data.id.split(
                'fnkp'
            );
            const memberId = await this.getDecryptedMember(encryptedMember);

            const groupId = await this.getDecryptedGroup(encryptedGroup);

            const [userData, group] = await Promise.all([
                userRepository.findUserDetails(memberId, [
                    'id',
                    'name',
                    'email',
                    'mobile'
                ]),
                GroupDetailsRepository.findGroupDetails(groupId, [
                    'id',
                    'groupName',
                    'about',
                    'subscriptionPlan',
                    'category'
                ])
            ]);

            console.log(userData, group);
            if (!userData || !group) {
                return new ResponseBuilder(400, {}, 'Incorrect Url');
            }

            const memberdata = await MemberGroupMapRepository.getMemberDetails(
                groupId,
                memberId,
                [
                    'id',
                    'currentPlan',
                    'expiryDate',
                    'memberStatus',
                    'joinedDate'
                ]
            );
            const differenceInDays = moment(memberdata['expiryDate']).diff(
                moment().format('YYYY-MM-DD'),
                'days'
            );

            const plans = JSON.parse(group.subscriptionPlan);

            const currentPlan =
                differenceInDays <= 0 ? {} : JSON.parse(memberdata.currentPlan);
            const actualCurrentPlan =
                currentPlan['selectedOffer'] == 'Free Trial'
                    ? []
                    : plans.filter(
                          (plan) =>
                              plan['selectedPeriod'] ===
                                  currentPlan['selectedPeriod'] &&
                              plan['price'] == currentPlan['price']
                      );
            let planList;

            if (currentPlan['selectedPeriod'] == 'Custom Period') {
                planList = plans.filter(
                    (plan) => plan['periodTitle'] != currentPlan['periodTitle']
                );
            } else {
                planList = plans.filter(
                    (plan) =>
                        plan['selectedPeriod'] != currentPlan['selectedPeriod']
                );
            }

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

            console.log(subscriptionPlansToDisplay, 'sub-3');
            group.subscriptionPlan = JSON.stringify(subscriptionPlansToDisplay);

            //

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

            return new ResponseBuilder(
                200,
                {
                    user: userData,
                    group: group,
                    memberdata: {
                        ...memberdata['dataValues'],
                        differenceInDays:
                            differenceInDays > 0 ? differenceInDays : 0,
                        currentPlan:
                            actualCurrentPlan.length && differenceInDays > 0
                                ? JSON.stringify(actualCurrentPlan[0])
                                : ''
                    },
                    token
                },
                SUCCESS_200
            );
        } catch (error) {
            return new ResponseBuilder(400, {}, 'Something went wrong');
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
                    include: {
                        model: User,
                        attributes: ['name']
                    },
                    attributes: [
                        'createdAt',
                        'amount',
                        'buyerId',
                        'sellerId',
                        'fankonnectCommission',
                        'currentPlan',
                        'migrated',
                        'orderId',
                        'renewed'
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

            return new ResponseBuilder(
                200,
                {
                    paymentBreakdown,
                    totalPurchases: channelDetails.length
                        ? channelDetails[0]['dataValues']['totalPurchases']
                        : 0,
                    totalAmount: channelDetails.length
                        ? channelDetails[0]['dataValues']['totalAmount']
                        : 0
                },
                SUCCESS_200
            );
        } catch (error) {
            return new ResponseBuilder(400, {}, BAD_CLIENT_REQUEST_400);
        }
    }

    async extendMembersExpiry(data: any) {
        try {
            const { membersData, groupId } = data;

            console.log(membersData, groupId);

            for (let member of membersData) {
                const user = await User.findOne({
                    where: {
                        mobile: member.mobile
                    },
                    attributes: ['id'],
                    raw: true
                });

                const memberData = await MemberGroupMap.findOne({
                    where: {
                        memberId: user.id,
                        groupId: groupId
                    },
                    raw: true
                });
                const plan = await GroupSubscriptionPlans.findOne({
                    where: {
                        id: memberData.planId
                    }
                });
                let expiryDate: any = moment(member.expiryDate).format(
                    'YYYY-MM-DD'
                );
                let expiryTimestamp: any = moment(member.expiryDate).format(
                    'YYYY-MM-DD HH:mm:ss'
                );
                if (plan && plan.selectedPeriod === 'Lifetime') {
                    continue;
                } else if (memberData.memberStatus === 'expired') {
                    await MemberGroupMap.update(
                        {
                            expiryDate: expiryDate,
                            inviteLink: null,
                            joinedBy: null,
                            expiryTimestamp: expiryTimestamp,
                            memberStatus: 'renewed',
                            isActive: 0,
                            isAdded: 1,
                            status: 'migrating'
                        },
                        {
                            where: {
                                id: memberData.id
                            }
                        }
                    );
                } else if (
                    (memberData.status === 'success' ||
                        memberData.status === 'migrating') &&
                    !memberData.isLeft
                ) {
                    expiryDate =
                        memberData['expiryDate'] > expiryDate
                            ? memberData['expiryDate']
                            : expiryDate;
                    expiryTimestamp =
                        moment(memberData['expiryTimestamp']).format(
                            'YYYY-MM-DD HH:mm:ss'
                        ) > expiryTimestamp
                            ? memberData['expiryTimestamp']
                            : expiryTimestamp;
                    await MemberGroupMap.update(
                        {
                            expiryDate: expiryDate,
                            expiryTimestamp: expiryTimestamp,
                            memberStatus: 'renewed'
                        },
                        {
                            where: {
                                id: memberData.id
                            }
                        }
                    );
                } else if (
                    memberData.status === 'success' &&
                    memberData.isLeft
                ) {
                    expiryDate =
                        memberData['expiryDate'] > expiryDate
                            ? memberData['expiryDate']
                            : expiryDate;
                    expiryTimestamp =
                        moment(memberData['expiryTimestamp']).format(
                            'YYYY-MM-DD HH:mm:ss'
                        ) > expiryTimestamp
                            ? memberData['expiryTimestamp']
                            : expiryTimestamp;
                    if (memberData.inviteLink) {
                        const botTokenPrimary =
                            await groupBotRepository.findOne({
                                groupId: memberData.groupId,
                                isActive: 1,
                                isPrimary: 1
                            });
                        const channel = await GroupDetails.findOne({
                            where: {
                                id: memberData.groupId
                            },
                            attributes: ['channelId']
                        });
                        if (channel && botTokenPrimary) {
                            await Telegram.revokeLinkViaBot(
                                botTokenPrimary.botToken.token,
                                memberData.inviteLink,
                                channel.channelId
                            );
                        }
                    }

                    await MemberGroupMap.update(
                        {
                            expiryDate: expiryDate,
                            inviteLink: null,
                            joinedBy: null,
                            expiryTimestamp: expiryTimestamp,
                            memberStatus: 'renewed',
                            isActive: 0,
                            isAdded: 1,
                            status: 'migrating'
                        },
                        {
                            where: {
                                id: memberData.id
                            }
                        }
                    );
                } else if (memberData.status === 'pending') {
                    const expiryInfo = await memberService.calculateExpiry(
                        memberData.memberId,
                        memberData.groupId,
                        new Date(),
                        memberData.currentPlan,
                        'pending',
                        memberData.planId
                    );
                    console.log('inviteLink', memberData.inviteLink);
                    if (memberData.inviteLink) {
                        const botTokenPrimary =
                            await groupBotRepository.findOne({
                                groupId: memberData.groupId,
                                isActive: 1,
                                isPrimary: 1
                            });
                        const channel = await GroupDetails.findOne({
                            where: {
                                id: memberData.groupId
                            },
                            attributes: ['channelId']
                        });
                        console.log(botTokenPrimary, channel);
                        if (channel && botTokenPrimary) {
                            const result = await Telegram.revokeLinkViaBot(
                                botTokenPrimary.botToken.token,
                                memberData.inviteLink,
                                channel.channelId
                            );
                            console.log('result ', result);
                        }
                    }
                    expiryDate =
                        expiryInfo['expiryDate'] > expiryDate
                            ? expiryInfo['expiryDate']
                            : expiryDate;
                    expiryTimestamp =
                        expiryInfo['expiryTimestamp'] > expiryTimestamp
                            ? expiryInfo['expiryTimestamp']
                            : expiryTimestamp;
                    if (plan && plan.selectedPeriod === 'Lifetime') {
                        expiryDate = null;
                        expiryTimestamp = null;
                    }
                    await MemberGroupMap.update(
                        {
                            expiryDate: expiryDate,
                            inviteLink: null,
                            joinedBy: null,
                            expiryTimestamp: expiryTimestamp,
                            memberStatus: 'renewed',
                            isActive: 0,
                            isAdded: 1,
                            status: 'migrating'
                        },
                        {
                            where: {
                                id: memberData.id
                            }
                        }
                    );
                }
            }

            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    async sendMailWithInvoice(
        paymentId: number,
        payer: any,
        amount: number,
        emailTemplateData: any,
        cronPayload?: any
    ) {
        // check receipt active
        console.log('invoice mail', cronPayload, payer);

        try {
            let attachmentUrls = [];
            let pdfBuffer;
            let filename;

            if (!cronPayload) {
                cronPayload = await paymentRepository.getPaymentById(paymentId);
            }
            console.log(cronPayload);

            const [receipt, org, creatorDetails] = await Promise.all([
                receiptDetailsRepository.getDetail(
                    {
                        userId: cronPayload.sellerId,
                        isActive: 1
                    },
                    [
                        {
                            model: User,
                            attributes: ['name', 'email', 'mobile']
                        }
                    ]
                ),
                CreatorInfo.findOne({
                    where: {
                        userId: cronPayload.sellerId
                    }
                }),
                User.findByPk(cronPayload.sellerId, {
                    attributes: ['state', 'name', 'mobile', 'email']
                })
            ]);

            // get seller information
            // get buyer information

            // structure params
            let subTotal;
            let redisIncr;
            // switch template here //TODO:
            // subscription purchase/renew
            let emailTemplate = emailTemplateData || {
                userName: cronPayload.name,
                groupName: cronPayload.groupName,
                adminName: receipt ? receipt.creator.name : creatorDetails.name,
                inviteLink: cronPayload.inviteLink
                    ? cronPayload.inviteLink.replace('t.me', 'telegram.me')
                    : ''
            };

            if (cronPayload.conditionalApproval) {
                if (cronPayload.formLink) {
                    emailTemplate['formLink'] = cronPayload.formLink;
                }
            }

            // need
            // subscription extend

            if (receipt && cronPayload) {
                let receiptName;
                console.log('receipt found', receipt);
                console.log('receipt payload', cronPayload, amount);
                const plan = JSON.parse(cronPayload.currentPlan);
                // check state
                const stateMatch = payer.state
                    ? this.matchState(receipt.state, payer.state)
                    : false;

                if (
                    receipt.invoiceEnabled &&
                    cronPayload.orderId != 'freemium'
                ) {
                    if (emailTemplateData) {
                        return;
                    }
                    redisIncr = receipt.lastNumber
                        ? receipt.lastNumber + 1
                        : receipt.startNumber;

                    const num = await leading_zero(
                        redisIncr,
                        receipt.minInvoiceNoLength
                    );

                    receiptName = receipt.invoiceName + '-' + num;
                } else {
                    receiptName =
                        receipt.orgName
                            .replace(/ /g, '')
                            .slice(0, 3)
                            .toUpperCase() +
                        '-' +
                        org.id +
                        '-' +
                        paymentId;
                }

                let gstConfig;
                if (stateMatch) {
                    gstConfig = 0.09;
                } else {
                    gstConfig = 0.18;
                }
                subTotal = receipt.gstNumber
                    ? Number((amount / 1.18).toFixed(2))
                    : amount;
                // receipt
                const gst = receipt.gstNumber
                    ? Number((subTotal * 0.18).toFixed(2))
                    : 0;
                // imnvoice
                const sgst = Number((subTotal * gstConfig).toFixed(2));
                const cgst = Number((subTotal * gstConfig).toFixed(2));
                const igst = Number((subTotal * 0.18).toFixed(2));
                // const total = receipt.gstNumber
                //     ? Number(gst + subTotal).toFixed(2)
                //     : subTotal;
                const roundOff = Number(
                    amount -
                        (subTotal +
                            (receipt.invoiceEnabled
                                ? stateMatch
                                    ? sgst + cgst
                                    : igst
                                : gst))
                ).toFixed(2);
                // const invoiceTotal = stateMatch
                //     ? Number(cgst + sgst + subTotal).toFixed(2)
                //     : Number(igst + subTotal).toFixed(2);
                const discount =
                    (plan.discount || 0) + (cronPayload.couponDiscount || 0);

                let x = amount.toFixed(2).split('.');

                const x1 = converter.toWords(x[0]);
                const x2 = x[1] ? converter.toWords(x[1]) : '';
                const word = x1 + (x2 ? ` and ${x2} Paisa ` : '');
                let data = {
                    orgName: receipt.orgName,
                    address: receipt.address,
                    gstNumber: receipt.gstNumber,
                    mobile: receipt.creator.mobile,
                    email: receipt.creatorEmail
                        ? receipt.creatorEmail
                        : receipt.creator.email,
                    payerMobile: payer.mobile,
                    payerEmail: payer.email,
                    payerName: payer.name,
                    fees: plan.price,
                    discount,
                    subTotal,
                    gst,
                    // total: receipt.invoiceEnabled
                    //     ? invoiceTotal
                    //     : total.toFixed(2),
                    total: amount.toFixed(2),
                    orderedAt: moment(cronPayload.createdAt)
                        .add(5.5, 'hours')
                        .format('DD/MM/YYYY'),
                    receiptDate: payer.manual
                        ? moment(cronPayload.createdAt)
                              .add(5.5, 'hours')
                              .format('DD/MM/YYYY')
                        : moment().add(5.5, 'hours').format('DD/MM/YYYY'),
                    transactionId: cronPayload.orderId,
                    totalInWords: word,
                    validity:
                        plan.selectedPeriod == 'Custom Period'
                            ? plan.periodTitle
                            : plan.selectedPeriod,
                    receiptNo: receiptName,
                    paymentId,
                    invoiceEnabled:
                        cronPayload.orderId == 'freemium'
                            ? false
                            : receipt.invoiceEnabled,
                    igst,
                    cgst,
                    sgst,
                    stateMatch,
                    payerState: payer.state || '',
                    amount: amount.toFixed(2),
                    planName: cronPayload.groupName || emailTemplate.groupName,
                    roundOff
                };

                console.log('DATA--1', data);

                let headersList = {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                };

                let bodyContent = JSON.stringify(data);

                let reqOptions = {
                    url:
                        process.env.ENVIRONMENT == 'production'
                            ? 'https://us-central1-cp-prod-platform-whitelabel.cloudfunctions.net/generateReceipt'
                            : 'https://us-central1-cp-stg-platform-whtlbl-060921.cloudfunctions.net/generateReceipt',
                    method: 'POST',
                    headers: headersList,
                    data: bodyContent
                };

                let response = await axios.request(reqOptions);

                pdfBuffer = response.data.pdf;
                filename = response.data.name;

                console.log(response.data.url);
                attachmentUrls.push(response.data.url);
            }
            if (!receipt && creatorDetails.state && cronPayload) {
                let receiptName;
                console.table(creatorDetails);
                console.log('receipt payload', cronPayload, amount);
                const plan = JSON.parse(cronPayload.currentPlan);
                // check state
                const stateMatch = payer.state
                    ? this.matchState(creatorDetails.state, payer.state)
                    : false;

                receiptName =
                    creatorDetails.name
                        .replace(/ /g, '')
                        .slice(0, 3)
                        .toUpperCase() +
                    '-' +
                    org.id +
                    '-' +
                    paymentId;

                let gstConfig;
                if (stateMatch) {
                    gstConfig = 0.09;
                } else {
                    gstConfig = 0.18;
                }
                subTotal = amount;
                // receipt
                const gst = 0;
                // imnvoice
                const sgst = Number((subTotal * gstConfig).toFixed(2));
                const cgst = Number((subTotal * gstConfig).toFixed(2));
                const igst = Number((subTotal * 0.18).toFixed(2));
                // const total = receipt.gstNumber
                //     ? Number(gst + subTotal).toFixed(2)
                //     : subTotal;
                const roundOff = Number(amount - (subTotal + gst)).toFixed(2);
                // const invoiceTotal = stateMatch
                //     ? Number(cgst + sgst + subTotal).toFixed(2)
                //     : Number(igst + subTotal).toFixed(2);
                const discount =
                    (plan.discount || 0) + (cronPayload.couponDiscount || 0);

                let x = amount.toFixed(2).split('.');

                const x1 = converter.toWords(x[0]);
                const x2 = x[1] ? converter.toWords(x[1]) : '';
                const word = x1 + (x2 ? ` and ${x2} Paisa ` : '');
                let data = {
                    orgName: creatorDetails.name,
                    address: '',
                    gstNumber: '',
                    mobile: creatorDetails.mobile,
                    email: creatorDetails.email,
                    payerMobile: payer.mobile,
                    payerEmail: payer.email,
                    payerName: payer.name,
                    fees: plan.price,
                    discount,
                    subTotal,
                    gst,
                    // total: receipt.invoiceEnabled
                    //     ? invoiceTotal
                    //     : total.toFixed(2),
                    total: amount.toFixed(2),
                    orderedAt: moment(cronPayload.createdAt)
                        .add(5.5, 'hours')
                        .format('DD/MM/YYYY'),
                    receiptDate: payer.manual
                        ? moment(cronPayload.createdAt)
                              .add(5.5, 'hours')
                              .format('DD/MM/YYYY')
                        : moment().add(5.5, 'hours').format('DD/MM/YYYY'),
                    transactionId: cronPayload.orderId,
                    totalInWords: word,
                    validity:
                        plan.selectedPeriod == 'Custom Period'
                            ? plan.periodTitle
                            : plan.selectedPeriod,
                    receiptNo: receiptName,
                    paymentId,
                    invoiceEnabled: false,

                    igst,
                    cgst,
                    sgst,
                    stateMatch,
                    payerState: payer.state || '',
                    amount: amount.toFixed(2),
                    planName: cronPayload.groupName || emailTemplate.groupName,
                    roundOff,
                    creatorState: creatorDetails.state
                };

                console.log('DATA--1', data);

                let headersList = {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                };

                let bodyContent = JSON.stringify(data);

                let reqOptions = {
                    url:
                        process.env.ENVIRONMENT == 'production'
                            ? 'https://us-central1-cp-prod-platform-whitelabel.cloudfunctions.net/generateReceipt'
                            : 'https://us-central1-cp-stg-platform-whtlbl-060921.cloudfunctions.net/generateReceipt',
                    method: 'POST',
                    headers: headersList,
                    data: bodyContent
                };

                let response = await axios.request(reqOptions);

                pdfBuffer = response.data.pdf;
                filename = response.data.name;

                console.log(response.data.url);
                attachmentUrls.push(response.data.url);
            }
            if (attachmentUrls[0]) {
                paymentRepository.updatePayment(
                    { invoiceLink: attachmentUrls[0] },
                    paymentId,
                    cronPayload.buyerId
                );

                receipt &&
                    receipt.invoiceEnabled &&
                    receipt.update({
                        lastNumber: redisIncr
                    });
                if (cronPayload.extended) {
                    // no mail t TODO:ill get template
                    return;
                }
            }

            // mail for creator domain
            if (
                receipt &&
                receipt.invoiceEnabled &&
                cronPayload.orderId != 'freemium'
            ) {
                if (receipt.creatorEmail) {
                    // TODO:// switch between 2 templates
                    console.log('buffer', pdfBuffer, pdfBuffer.data);
                    const file = {
                        filename: filename,
                        data: Buffer.from(pdfBuffer.data)
                    };
                    const html = !cronPayload.extended
                        ? getNewPaymentTemplate(emailTemplate)
                        : '';
                    const payload = {
                        from: receipt.creatorEmail,
                        to: payer.email,
                        subject: process.env.COMM_ACCESS_EMAIL_GROUP_ADDITION,
                        html,
                        attachment: [file]
                    };
                    cronPayload.inviteLink && sendMailGunMail(payload);
                    return;
                }
            }

            !payer.manual &&
                payer.email &&
                Group.sendEmail(
                    [payer.email],
                    process.env.COMM_ACCESS_EMAIL_GROUP_ADDITION,
                    Number(
                        emailTemplate.formLink
                            ? process.env
                                  .COMM_ACCESS_EMAIL_GROUP_ADDITION_TEMPLATE_WITHFORM
                            : process.env
                                  .COMM_ACCESS_EMAIL_GROUP_ADDITION_TEMPLATE
                    ),
                    null,
                    emailTemplate,
                    attachmentUrls
                );
        } catch (err) {
            console.log('err', err);
        }

        // generate invoice
        // upload invoice
        // get invoice url
        // async save url in db
        // send mail with or without attachment
    }

    async sendMailWithInvoiceManual(
        paymentId: number,
        payer: any,
        amount: number,
        emailTemplateData: any,
        cronPayload?: any
    ) {
        // check receipt active
        console.log('invoice mail', cronPayload);

        try {
            let attachmentUrls = [];
            let pdfBuffer;
            let filename;

            if (!cronPayload) {
                cronPayload = await paymentRepository.getPaymentById(paymentId);
            }
            console.log(cronPayload);

            const [receipt, org] = await Promise.all([
                receiptDetailsRepository.getDetail(
                    {
                        userId: cronPayload.sellerId
                    },
                    [
                        {
                            model: User,
                            attributes: ['name', 'email', 'mobile']
                        }
                    ]
                ),
                CreatorInfo.findOne({
                    where: {
                        userId: cronPayload.sellerId
                    }
                })
            ]);

            // get seller information
            // get buyer information

            // structure params
            let subTotal;
            let redisIncr;
            // switch template here //TODO:
            // subscription purchase/renew
            let emailTemplate = emailTemplateData || {
                userName: cronPayload.name,
                groupName: cronPayload.groupName,
                adminName: receipt.creator.name,
                inviteLink: cronPayload.inviteLink
                    ? cronPayload.inviteLink.replace('t.me', 'telegram.me')
                    : ''
            };

            if (cronPayload.conditionalApproval) {
                if (cronPayload.formLink) {
                    emailTemplate['formLink'] = cronPayload.formLink;
                }
            }

            // need
            // subscription extend

            if (receipt && cronPayload) {
                let receiptName;
                console.log('receipt found', receipt);
                console.log('receipt payload', cronPayload, amount);
                const plan = JSON.parse(cronPayload.currentPlan);
                // check state
                const stateMatch = payer.state
                    ? this.matchState(receipt.state, payer.state)
                    : false;

                if (
                    receipt.invoiceEnabled &&
                    cronPayload.orderId != 'freemium'
                ) {
                    if (emailTemplateData) {
                        return;
                    }
                    redisIncr = receipt.lastNumber
                        ? receipt.lastNumber + 1
                        : receipt.startNumber;

                    const num = await leading_zero(
                        redisIncr,
                        receipt.minInvoiceNoLength
                    );

                    receiptName = receipt.invoiceName + '-' + num;
                } else {
                    receiptName =
                        receipt.orgName
                            .replace(/ /g, '')
                            .slice(0, 3)
                            .toUpperCase() +
                        '-' +
                        org.id +
                        '-' +
                        paymentId;
                }

                let gstConfig;
                if (stateMatch) {
                    gstConfig = 0.09;
                } else {
                    gstConfig = 0.18;
                }
                subTotal = receipt.gstNumber
                    ? Number((amount / 1.18).toFixed(2))
                    : amount;
                // receipt
                const gst = receipt.gstNumber
                    ? Number((subTotal * 0.18).toFixed(2))
                    : 0;
                // imnvoice
                const sgst = Number((subTotal * gstConfig).toFixed(2));
                const cgst = Number((subTotal * gstConfig).toFixed(2));
                const igst = Number((subTotal * 0.18).toFixed(2));
                // const total = receipt.gstNumber
                //     ? Number(gst + subTotal).toFixed(2)
                //     : subTotal;
                const roundOff = Number(
                    amount -
                        (subTotal +
                            (receipt.invoiceEnabled
                                ? stateMatch
                                    ? sgst + cgst
                                    : igst
                                : gst))
                ).toFixed(2);
                // const invoiceTotal = stateMatch
                //     ? Number(cgst + sgst + subTotal).toFixed(2)
                //     : Number(igst + subTotal).toFixed(2);
                const discount =
                    (plan.discount || 0) + (cronPayload.couponDiscount || 0);

                let x = amount.toFixed(2).split('.');

                const x1 = converter.toWords(x[0]);
                const x2 = x[1] ? converter.toWords(x[1]) : '';
                const word = x1 + (x2 ? ` and ${x2} Paisa ` : '');
                let data = {
                    orgName: receipt.orgName,
                    address: receipt.address,
                    gstNumber: receipt.gstNumber,
                    mobile: receipt.creator.mobile,
                    email: receipt.creatorEmail
                        ? receipt.creatorEmail
                        : receipt.creator.email,
                    payerMobile: payer.mobile,
                    payerEmail: payer.email,
                    payerName: payer.name,
                    fees: plan.price,
                    discount,
                    subTotal,
                    gst,
                    // total: receipt.invoiceEnabled
                    //     ? invoiceTotal
                    //     : total.toFixed(2),
                    total: amount.toFixed(2),
                    orderedAt: moment(cronPayload.createdAt)
                        .add(5.5, 'hours')
                        .format('DD/MM/YYYY'),
                    receiptDate: payer.manual
                        ? moment(cronPayload.createdAt)
                              .add(5.5, 'hours')
                              .format('DD/MM/YYYY')
                        : moment().add(5.5, 'hours').format('DD/MM/YYYY'),
                    transactionId: cronPayload.orderId,
                    totalInWords: word,
                    validity:
                        plan.selectedPeriod == 'Custom Period'
                            ? plan.periodTitle
                            : plan.selectedPeriod,
                    receiptNo: receiptName,
                    paymentId,
                    invoiceEnabled:
                        cronPayload.orderId == 'freemium'
                            ? false
                            : receipt.invoiceEnabled,
                    igst,
                    cgst,
                    sgst,
                    stateMatch,
                    payerState: payer.state || '',
                    amount: amount.toFixed(2),
                    planName: cronPayload.groupName || emailTemplate.groupName,
                    roundOff
                };

                console.log('DATA--1', data);

                let headersList = {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                };

                let bodyContent = JSON.stringify(data);

                let reqOptions = {
                    url:
                        process.env.ENVIRONMENT == 'production'
                            ? 'https://us-central1-cp-prod-platform-whitelabel.cloudfunctions.net/generateReceipt'
                            : 'https://us-central1-cp-stg-platform-whtlbl-060921.cloudfunctions.net/generateReceipt',
                    method: 'POST',
                    headers: headersList,
                    data: bodyContent
                };

                let response = await axios.request(reqOptions);

                pdfBuffer = response.data.pdf;
                filename = response.data.name;

                console.log(response.data.url);
                attachmentUrls.push(response.data.url);
            }
            if (attachmentUrls[0]) {
                paymentRepository.updatePayment(
                    { invoiceLink: attachmentUrls[0] },
                    paymentId,
                    cronPayload.buyerId
                );

                receipt.invoiceEnabled &&
                    receipt.update({
                        lastNumber: redisIncr
                    });
                if (cronPayload.extended) {
                    // no mail t TODO:ill get template
                    return;
                }
            }

            // mail for creator domain
            if (
                receipt &&
                receipt.invoiceEnabled &&
                cronPayload.orderId != 'freemium'
            ) {
                if (receipt.creatorEmail) {
                    // TODO:// switch between 2 templates
                    console.log('buffer', pdfBuffer, pdfBuffer.data);
                    const file = {
                        filename: filename,
                        data: Buffer.from(pdfBuffer.data)
                    };
                    const html = !cronPayload.extended
                        ? getNewPaymentTemplate(emailTemplate)
                        : '';
                    const payload = {
                        from: receipt.creatorEmail,
                        to: payer.email,
                        subject: process.env.COMM_ACCESS_EMAIL_GROUP_ADDITION,
                        html,
                        attachment: [file]
                    };
                    cronPayload.inviteLink && sendMailGunMail(payload);
                    return;
                }
            }

            !payer.manual &&
                payer.email &&
                Group.sendEmail(
                    [payer.email],
                    process.env.COMM_ACCESS_EMAIL_GROUP_ADDITION,
                    Number(
                        emailTemplate.formLink
                            ? process.env
                                  .COMM_ACCESS_EMAIL_GROUP_ADDITION_TEMPLATE_WITHFORM
                            : process.env
                                  .COMM_ACCESS_EMAIL_GROUP_ADDITION_TEMPLATE
                    ),
                    null,
                    emailTemplate,
                    attachmentUrls
                );
        } catch (err) {
            console.log('err', err);
        }

        // generate invoice
        // upload invoice
        // get invoice url
        // async save url in db
        // send mail with or without attachment
    }

    async checkAdminStatusWhatsapp() {
        try {
            const pendingGroups: any = await sequelize.query(
                `
				SELECT gd.id, gd.createdBy, gd.updatedAt, u.mobile, u.id as userId, gd.channelId, u.name, gd.groupName, gd.type
				from  group_details gd 
				INNER JOIN users u ON u.id = gd.createdBy 
				WHERE gd.status='pending' AND (gd.type='whatsappCommunity' OR gd.type='whatsappGroup' ) ORDER BY gd.createdAt DESC limit 10`,
                { type: QueryTypes.SELECT }
            );
            console.log(
                'Whatsapp Community Pending Groups admins',
                pendingGroups
            );
            for (const value of pendingGroups) {
                try {
                    console.log('Pending group', value);
                    const userObj = await userRepository.findOneById(
                        value.createdBy
                    );

                    if (!userObj) {
                        continue;
                    }
                    const primaryNumber =
                        await phoneIdRepository.findActivePhone(value.id);

                    const payload = {
                        channelId: value.channelId,

                        mobile: value.mobile,
                        id: value.userId,
                        whatsappNumber: value.whatsappNumber,
                        updatedAt: value.updatedAt,
                        groupId: value.id,
                        phoneId: primaryNumber.phone.phoneId
                    };
                    const result =
                        await whatsappAutomation.findAdminAndUpdateAdminRightsWhatsapp(
                            payload
                        );
                    if (!result) {
                        console.log('failed to add creator as admin**********');
                        continue;
                    }

                    await Promise.all([
                        freshchatService.sendWAadminPromotionFreshchatServiceRequest(
                            value.name,
                            value.groupName,
                            value.type.slice(8),
                            value.mobile,
                            value.id
                        ),

                        // update in db with success status
                        GroupDetailsRepository.updateGroupStatus(
                            value.id,
                            userObj.id,
                            { status: 'success' }
                        )
                    ]);

                    await Telegram.sleep(2000);
                } catch (err) {
                    console.log(
                        `err in updating admin of ${value.id}`,
                        err.message
                    );
                }
            }
            await RedisManager.decrCount('checkCreator');

            await Telegram.sleep(10000);
            return true;
        } catch (error) {
            console.error(error);
        }
    }

    async getAutomateBot() {
        const bot = await botTokenRepository.findAutomateBot();
        if (!bot) {
            return new ResponseBuilder(
                200,
                {
                    botLink: null
                },
                SUCCESS_200
            );
        }
        let axios = require('axios').default;

        let options = {
            method: 'GET',
            url: `https://api.telegram.org/bot${bot.token}/getMe`,
            headers: { Accept: '*/*' }
        };

        const data = await axios.request(options);

        return new ResponseBuilder(
            200,
            {
                botLink:
                    data && data.data && data.data.result
                        ? `https://telegram.me/${data.data.result.username}`
                        : null
            },
            SUCCESS_200
        );
    }

    matchState(state1: string, state2: string) {
        return (
            state1.replace(/ /g, '').toLowerCase() ==
            state2.replace(/ /g, '').toLowerCase()
        );
    }

    setCurrentTimeInRedis(key) {
        const data = {
            startTime: moment().unix()
        };
        RedisManager.setData(key, JSON.stringify(data));
    }
}

export default new groupService();
