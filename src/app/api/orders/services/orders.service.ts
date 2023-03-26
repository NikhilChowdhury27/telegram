import CommonService from '../../../utils/common.service';
import { IorderPayload } from '../orders.interface';
import MemberGroupMapRepository from '../../../repository/member.group.map';
import GroupDetailsRepository from '../../../repository/group.repository';
import TutorBankDetailRepository from '../../../repository/tutorBankDetails.repository';
import RZPService from './razorpay.service';
const { ResponseBuilder } = require('base-packages');
import PaymentRepository from '../../../repository/payment.repository';
import groupService from '../../groups/services/group';
import messageService from '../../messages/services/message.service';
import MemberService from '../../messageMembers/services/message.member';
import userRepository from '../../../repository/user.repository';
import TransferRepository from '../../../repository/transfer.details.repository';
import * as crypto from 'crypto';
import LockedMessage from '../../../../models/LockedMessageDetail';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../../../sequelize';
import telegram from '../../../utils/telegram/telegram.common';
import MemberGroupMap from '../../../../models/MemberGroupMap';
import { sendNotificationToGoogleChat } from '../../../utils/alert.utils';
import { RAZORPAY_CHAT_URL } from '../../../../config/constant';
import PaymentTable from '../../../../models/PaymentTable';
import memberService from '../../members/services/member.service';
import PubSubService from '../../../consumers/gcp.pubsub.consumer';
import RedisManager from '../../../../config/conf/RedisCache';
import Coupons from '../../../../models/Coupon';
import groupRepository from '../../../repository/group.repository';
import SettlementDetails from '../../../../models/settlementDetails';
import BankDetail from '../../../../models/BankDetail';
import razorpayService from './razorpay.service';
import TransferDetails from '../../../../models/transferDetails';
// import RedisManager from '../../../../config/conf/RedisCache';

class orderService extends CommonService {
    async createOrder(payload: IorderPayload) {
        let paymentAmount: number;
        let tutorId: number;
        let subscriptionPlan;
        if (payload.orderType === 'group') {
            // let isMemberAlreadyJoined =
            //     await MemberGroupMapRepository.hasMemberJoinedGroup(
            //         payload.groupId,
            //         payload.userId
            //     );
            // if (isMemberAlreadyJoined) {
            //     return new ResponseBuilder(
            //         400,
            //         {},
            //         'You have already joined this group'
            //     );
            // }
            let groupDetails = await GroupDetailsRepository.findGroupById(
                payload.groupId
            );
            if (!groupDetails) {
                return new ResponseBuilder(400, {}, 'Group not found');
            }
            let period = payload.period;
            const paymentPlans = JSON.parse(groupDetails['subscriptionPlan']);

            // if (period) {
            //     paymentAmount = subscriptionPlan['paymentPeriod']['price'];
            //     delete subscriptionPlan['accessPrice'];
            // } else {
            //     paymentAmount = subscriptionPlan['accessPrice'];
            //     subscriptionPlan['paymentPeriod'] = undefined;
            // }

            console.log(paymentPlans, period, payload.periodTitle);
            if (period == 'Custom Period') {
                subscriptionPlan = paymentPlans.find(
                    (plan) =>
                        plan.selectedPeriod === period &&
                        plan.periodTitle == payload.periodTitle
                );
            } else {
                subscriptionPlan = paymentPlans.find(
                    (plan) => plan.selectedPeriod === period
                );
            }
            console.log('SUB-1', subscriptionPlan);

            if (!subscriptionPlan) {
                return new ResponseBuilder(400, {}, 'Payment plan not found');
            }
            paymentAmount = subscriptionPlan.price - subscriptionPlan.discount;
            tutorId = groupDetails['createdBy'];
        } else if (payload.orderType === 'message') {
            let isMemberAccess = await MemberService.checkMessageMembership(
                payload.userId,
                payload.messageId
            );
            if (isMemberAccess.data) {
                return new ResponseBuilder(
                    400,
                    {},
                    'You have already have access to this content'
                );
            }
            let messageDetails = await messageService.findMessageById(
                payload.messageId
            );
            if (!messageDetails) {
                return new ResponseBuilder(400, {}, 'Content not found');
            }
            paymentAmount = messageDetails['messagePrice'];
            tutorId = messageDetails['createdBy'];
            if (!paymentAmount) {
                return new ResponseBuilder(400, {}, 'Payment amount not found');
            }
        }
        let isFreemium = subscriptionPlan.selectedOffer == 'Free Trial';
        let tutorBankDetails;
        if (!isFreemium) {
            tutorBankDetails =
                await TutorBankDetailRepository.getTutorBankDetailByTutorId(
                    tutorId
                );
            console.log(
                'tutorBankDetails :: ',
                tutorBankDetails,
                paymentAmount
            );
            if (!tutorBankDetails || !tutorBankDetails.accountId) {
                return new ResponseBuilder(
                    400,
                    {},
                    'Tutor bank details not found'
                );
            }
        }
        let orderId = isFreemium
            ? 'freemium'
            : String(payload.userId) + Date.now().toString();

        let payment = await PaymentRepository.createPayment({
            sellerId: tutorId,
            amount: paymentAmount,
            orderType: payload.orderType,
            groupId: payload.groupId,
            messageId: payload.messageId,
            buyerId: payload.userId,
            orderId: orderId,
            currentPlan: JSON.stringify(subscriptionPlan),
            status: isFreemium ? 'Success' : null,
            paymentStatus: isFreemium ? 'success' : null
        });
        // isFreemium && this.giveAccessForPayment(payment);
        try {
            let rzpPayload;
            let response;
            let freemiumResponse;
            if (!isFreemium) {
                rzpPayload = {
                    amount: paymentAmount,
                    currency: 'INR',
                    orderId,
                    accountId: tutorBankDetails.accountId,
                    userId: payload.userId,
                    orderType: payload.orderType,
                    paymentId: payment['dataValues'].id,
                    fankonnectCommisionPerc:
                        tutorBankDetails.fankonnectCommisionPerc
                };
                response = await RZPService.createOrder(rzpPayload);
                if (response && response.id) {
                    await PaymentRepository.updatePayment(
                        { transactionId: response.id },
                        payment['dataValues'].id,
                        payload.userId
                    );
                } else {
                    return new ResponseBuilder(
                        400,
                        {},
                        'Not able to create order'
                    );
                }
            } else {
                freemiumResponse = await this.giveAccessForPayment(payment);
            }
            return new ResponseBuilder(
                200,
                {
                    payload: response,
                    orderId: orderId,
                    freemiumCreateResponse: freemiumResponse,
                    email: payload.email
                },
                'Order created successfully'
            );
        } catch (err) {
            console.log('er in creating razorpay order', err);
            await PaymentRepository.updatePayment(
                { error: err.message },
                orderId,
                payload.userId
            );
            return new ResponseBuilder(500, {}, err.message);
        }
    }

    async createOrderDuplicate(
        payload: IorderPayload,
        concurrency: number,
        limit: number
    ) {
        for (let i = 0; i < limit; i += concurrency) {
            Array(concurrency)
                .fill(1)
                .forEach(async () => {
                    let paymentAmount: number;
                    let tutorId: number;
                    let subscriptionPlan;

                    let groupDetails =
                        await GroupDetailsRepository.findGroupById(
                            payload.groupId
                        );
                    if (!groupDetails) {
                        return new ResponseBuilder(400, {}, 'Group not found');
                    }
                    let period = payload.period;
                    const paymentPlans = JSON.parse(
                        groupDetails['subscriptionPlan']
                    );

                    // if (period) {
                    //     paymentAmount = subscriptionPlan['paymentPeriod']['price'];
                    //     delete subscriptionPlan['accessPrice'];
                    // } else {
                    //     paymentAmount = subscriptionPlan['accessPrice'];
                    //     subscriptionPlan['paymentPeriod'] = undefined;
                    // }

                    console.log(paymentPlans, period, payload.periodTitle);
                    if (period == 'Custom Period') {
                        subscriptionPlan = paymentPlans.find(
                            (plan) =>
                                plan.selectedPeriod === period &&
                                plan.periodTitle == payload.periodTitle
                        );
                    } else {
                        subscriptionPlan = paymentPlans.find(
                            (plan) => plan.selectedPeriod === period
                        );
                    }
                    console.log('SUB-1', subscriptionPlan);

                    if (!subscriptionPlan) {
                        return new ResponseBuilder(
                            400,
                            {},
                            'Payment plan not found'
                        );
                    }
                    paymentAmount =
                        subscriptionPlan.price - subscriptionPlan.discount;
                    tutorId = groupDetails['createdBy'];
                    let tutorBankDetails =
                        await TutorBankDetailRepository.getTutorBankDetailByTutorId(
                            tutorId
                        );
                    console.log(
                        'tutorBankDetails :: ',
                        tutorBankDetails,
                        paymentAmount
                    );
                    if (!tutorBankDetails || !tutorBankDetails.accountId) {
                        return new ResponseBuilder(
                            400,
                            {},
                            'Tutor bank details not found'
                        );
                    }
                    let orderId =
                        String(payload.userId) + Date.now().toString();

                    let payment = await PaymentRepository.createPayment({
                        sellerId: tutorId,
                        amount: paymentAmount,
                        orderType: payload.orderType,
                        groupId: payload.groupId,
                        messageId: payload.messageId,
                        buyerId: payload.userId,
                        orderId: 'test',
                        currentPlan: JSON.stringify(subscriptionPlan)
                    });
                    try {
                        // let rzpPayload = {
                        //     amount: paymentAmount,
                        //     currency: 'INR',
                        //     orderId,
                        //     accountId: tutorBankDetails.accountId,
                        //     userId: payload.userId,
                        //     orderType: payload.orderType,
                        //     paymentId: payment['dataValues'].id,
                        //     fankonnectCommisionPerc:
                        //         tutorBankDetails.fankonnectCommisionPerc
                        // };
                        // let response = await RZPService.createOrder(rzpPayload);

                        await PaymentRepository.updatePayment(
                            { transactionId: payment['dataValues'].id },
                            payment['dataValues'].id,
                            payload.userId
                        );
                    } catch (err) {
                        console.log('er in creating razorpay order', err);
                        await PaymentRepository.updatePayment(
                            { error: err.message },
                            orderId,
                            payload.userId
                        );
                    }
                });
        }
        return new ResponseBuilder(
            200,
            {
                sttaus: 'success'
            },
            'Order test created successfully'
        );
    }

    async giveAccessForPayment(payment) {
        let response;
        switch (payment.orderType) {
            case 'group':
                let group = await GroupDetailsRepository.findGroupById(
                    payment.groupId
                );
                // can be added a switch case in case of more platforms like zoom or other

                // TODO: change later

                if (
                    group.type === 'telegramChannel' ||
                    group.type === 'telegramExisting'
                ) {
                    await groupService.join({
                        groupId: payment.groupId,
                        userId: payment.buyerId,
                        plan: payment.currentPlan,
                        amount: payment.amount,
                        paymentId: payment.id,
                        planId: payment.planId
                    });
                } else if (
                    group.type === 'whatsappGroup' ||
                    group.type === 'whatsappCommunity'
                ) {
                    await groupService.whatsappJoin({
                        groupId: payment.groupId,
                        userId: payment.buyerId,
                        plan: payment.currentPlan,
                        amount: payment.amount,
                        paymentId: payment.id,
                        planId: payment.planId
                    });
                }
                const addedGroup =
                    await MemberGroupMapRepository.hasMemberJoinedGroupAndAdded(
                        group.id,
                        payment.buyerId
                    );

                // const botToken = await GroupBotMapRepository.findOne({
                //     groupId: payment.groupId,
                //     isActive: 1
                // });

                //     const inviteLink = await telegram.createInviteLinkBot(
                //         group.channelId,
                //         botToken.botToken.token
                //     );
                // console.log('ADDED GROUP', addedGroup, botData, inviteLink);
                let subText;
                let link;

                if (addedGroup.inviteLink) {
                    subText = `You can join the ${group.groupName} Telegram channel from the link given below`;
                    link = addedGroup.inviteLink.replace('t.me', 'telegram.me');
                } else {
                    subText = `Your Invite link to join Telegram group will be sent to you on phone. In case, it can take upto 2 hours.`;
                    link = null;
                }
                response = {
                    status: 'success',
                    groupName: group.groupName,
                    type: group.type,
                    groupLink: group.channelId,
                    formLink: group.formLink,
                    conditionalApproval: group.conditionalApproval,
                    isAlreadyAdded: Boolean(addedGroup && addedGroup.isAdded),
                    popupMessage: {
                        logoLink:
                            'https://storage.googleapis.com/cp-prod-cloudinary-as-sth1-gcs-iu7ed8/web/fanKonnect/telegram.png',
                        headerText: 'Payment Successful!!!',
                        subText,
                        inviteLink: link
                    },
                    paymentSuccessMessage: [
                        `Hi! You’ll be added to this exclusive Telegram channel within 2 hours via SMS. In case you don't have a telegram account,`,
                        ` 1. Please create an account on telegram using the number given at the time of payment.`,
                        `2. If still you are not added then please go to Settings on telegram and edit "Who can add me to group chats" to "Everybody" from the Privacy and Security tab.`
                    ]
                };
                break;
            case 'message':
                await messageService.addMembers(
                    payment.buyerId,
                    payment.messageId,
                    payment.id,
                    payment.amount
                );
                let messsge = await messageService.findMessageById(
                    payment.messageId
                );
                const memberShipDetails =
                    await MemberService.checkMessageMembership(
                        payment.buyerId,
                        payment.messageId
                    );
                const creator = await messageService.findMessageCreatorById(
                    payment.messageId
                );
                response = {
                    groupName: messsge.title,
                    groupLink: messsge.channelId,
                    isAlreadyAdded:
                        memberShipDetails &&
                        memberShipDetails.data &&
                        memberShipDetails.data.isAdded,
                    paymentSuccessMessage: [
                        `Hey! You'll be added to ${messsge.title} Telegram channel, where you can view exclusive content by ${creator['name']}.`,
                        ` In case you don't have a Telegram account,`,
                        ` 1. Please create an account from the number given at the time of payment.`,
                        ` 2. If still you are not added then please go to Settings on telegram and edit "Who can add me to group chats" to "Everybody" from the Privacy and Security tab.`
                    ]
                };
                break;
            default:
                break;
        }
        return response;
    }

    async giveAccessForPaymentTest(payment) {
        let response;
        switch (payment.orderType) {
            case 'group':
                await groupService.joinTest({
                    groupId: payment.groupId,
                    userId: payment.buyerId,
                    plan: payment.currentPlan,
                    amount: payment.amount,
                    paymentId: payment.id
                });
                let group = await GroupDetailsRepository.findGroupById(
                    payment.groupId
                );
                const addedGroup =
                    await MemberGroupMapRepository.hasMemberJoinedGroupAndAdded(
                        group.id,
                        payment.buyerId
                    );

                // const botToken = await GroupBotMapRepository.findOne({
                //     groupId: payment.groupId,
                //     isActive: 1
                // });

                //     const inviteLink = await telegram.createInviteLinkBot(
                //         group.channelId,
                //         botToken.botToken.token
                //     );
                // console.log('ADDED GROUP', addedGroup, botData, inviteLink);
                let subText;
                if (addedGroup.inviteLink) {
                    subText = `You can join the ${group.groupName} Telegram channel from the link given below`;
                } else {
                    subText = `Your Invite link to join Telegram group will be sent to you on phone. In case, it can take upto 2 hours.`;
                }
                response = {
                    status: 'success',
                    groupName: group.groupName,
                    groupLink: group.channelId,
                    formLink: group.formLink,
                    conditionalApproval: group.conditionalApproval,
                    isAlreadyAdded: Boolean(addedGroup && addedGroup.isAdded),
                    popupMessage: {
                        logoLink:
                            'https://storage.googleapis.com/cp-prod-cloudinary-as-sth1-gcs-iu7ed8/web/fanKonnect/telegram.png',
                        headerText: 'Payment Successful!!!',
                        subText,
                        inviteLink: addedGroup.inviteLink
                    },
                    paymentSuccessMessage: [
                        `Hi! You’ll be added to this exclusive Telegram channel within 2 hours via SMS. In case you don't have a telegram account,`,
                        ` 1. Please create an account on telegram using the number given at the time of payment.`,
                        `2. If still you are not added then please go to Settings on telegram and edit "Who can add me to group chats" to "Everybody" from the Privacy and Security tab.`
                    ]
                };
                break;
            case 'message':
                await messageService.addMembers(
                    payment.buyerId,
                    payment.messageId,
                    payment.id,
                    payment.amount
                );
                let messsge = await messageService.findMessageById(
                    payment.messageId
                );
                const memberShipDetails =
                    await MemberService.checkMessageMembership(
                        payment.buyerId,
                        payment.messageId
                    );
                const creator = await messageService.findMessageCreatorById(
                    payment.messageId
                );
                response = {
                    groupName: messsge.title,
                    groupLink: messsge.channelId,
                    isAlreadyAdded:
                        memberShipDetails &&
                        memberShipDetails.data &&
                        memberShipDetails.data.isAdded,
                    paymentSuccessMessage: [
                        `Hey! You'll be added to ${messsge.title} Telegram channel, where you can view exclusive content by ${creator['name']}.`,
                        ` In case you don't have a Telegram account,`,
                        ` 1. Please create an account from the number given at the time of payment.`,
                        ` 2. If still you are not added then please go to Settings on telegram and edit "Who can add me to group chats" to "Everybody" from the Privacy and Security tab.`
                    ]
                };
                break;
            default:
                break;
        }
        return response;
    }

    async craftResponseForPayment(payment, member: MemberGroupMap) {
        try {
            let group = await GroupDetailsRepository.findGroupById(
                payment.groupId
            );
            const addedGroup = member;

            let subText;
            if (addedGroup.inviteLink) {
                subText = `You can join the ${group.groupName} Telegram channel from the link given below`;
            } else {
                subText = `Your Invite link to join Telegram channel will be sent to you via SMS and Email. In some cases, it can take upto 2 hours.`;
            }
            const response = {
                status: 'success',
                groupName: group.groupName,
                type: group.type,
                groupLink: group.channelId,
                formLink: group.formLink,
                conditionalApproval: group.conditionalApproval,
                isAlreadyAdded: Boolean(addedGroup && addedGroup.isAdded),
                popupMessage: {
                    logoLink:
                        'https://storage.googleapis.com/cp-prod-cloudinary-as-sth1-gcs-iu7ed8/web/fanKonnect/telegram.png',
                    headerText: 'Payment Successful!!!',
                    subText,
                    inviteLink: addedGroup.inviteLink
                        ? addedGroup.inviteLink.replace('t.me', 'telegram.me')
                        : null
                },
                paymentSuccessMessage: [
                    `Hi! You’ll be added to this exclusive Telegram channel within 2 hours via SMS. In case you don't have a telegram account,`,
                    ` 1. Please create an account on telegram using the number given at the time of payment.`,
                    `2. If still you are not added then please go to Settings on telegram and edit "Who can add me to group chats" to "Everybody" from the Privacy and Security tab.`
                ]
            };
            return response;
        } catch (err) {
            console.log(err.message);
            return false;
        }
    }

    async updatePaymentStatusviaWebhook(data: any) {
        try {
            let getPaymentByTransactionIdParam = data.payload.payment
                ? data.payload.payment.entity.order_id
                : data.payload.transfer.entity.source;
            let payment =
                data.event !== 'settlement.processed'
                    ? await PaymentRepository.getPaymentByTransactionId(
                          getPaymentByTransactionIdParam
                      )
                    : null;
            console.log('payment in webhook', payment);

            // if (
            //     data.event == 'payment.captured' &&
            //     payment?.status === 'Success'
            // ) {
            //     return false;
            // }
            console.log('payment data', data.payload);
            switch (data.event) {
                case 'payment.captured':
                    const isAlreadyJoined =
                        await MemberGroupMapRepository.hasMemberJoinedGroupAndAdded(
                            payment.groupId,
                            payment.buyerId
                        );

                    await PaymentRepository.updatePayment(
                        {
                            paymentId: data.payload.payment.entity.id,
                            paymentDetails: JSON.stringify(data),
                            status: 'Success',
                            updatedBy: 'webhook',
                            paymentStatus: 'success',
                            renewed: isAlreadyJoined ? 1 : 0,
                            extended:
                                isAlreadyJoined && isAlreadyJoined.isActive
                                    ? 1
                                    : 0
                        },
                        payment.id,
                        payment.buyerId
                    );
                    await TransferRepository.createTransfer({
                        amount: data.payload.payment.entity.amount,
                        orderId: data.payload.payment.entity.order_id,
                        userId: payment.sellerId
                    });

                    await this.giveAccessForPayment(payment);
                    if (payment.couponName) {
                        const coupon = await Coupons.findOne({
                            where: {
                                groupId: payment.groupId,
                                name: payment.couponName
                            }
                        });
                        await Promise.all([
                            coupon.increment('memberCount'),
                            coupon.increment('totalEarnings', {
                                by: payment.amount
                            })
                        ]);
                    }

                    // await RedisManager.addToHashmap(payment.transactionId, {
                    //     status: 'Success',

                    //     paymentStatus: 'success'
                    // });

                    break;
                case 'payment.failed':
                    await PaymentRepository.updatePayment(
                        {
                            paymentId: data.payload.payment.entity.id,
                            paymentDetails: JSON.stringify(data),
                            status: 'Failed',
                            error: data.payload.payment.entity
                                .error_description,
                            updatedBy: 'webhook',
                            paymentStatus: 'failed'
                        },
                        payment.id,
                        payment.buyerId
                    );
                    // await RedisManager.addToHashmap(payment.transactionId, {
                    //     status: 'Failed',

                    //     paymentStatus: 'failed'
                    // });

                    break;
                case 'payment.authorized':
                    await PaymentRepository.updatePayment(
                        {
                            paymentId: data.payload.payment.entity.id,
                            paymentDetails: JSON.stringify(data),
                            status: 'Pending',
                            updatedBy: 'webhook'
                        },
                        payment.id,
                        payment.buyerId
                    );
                    break;
                case 'transfer.processed':
                    if (
                        data &&
                        data.payload &&
                        data.payload.transfer &&
                        data.payload.transfer.entity &&
                        data.payload.transfer.entity.id &&
                        data.payload.transfer.entity.amount &&
                        data.payload.transfer.entity.source &&
                        data.payload.transfer.entity.recipient
                    ) {
                        await TransferRepository.updateTransfer(
                            {
                                transferId: data.payload.transfer.entity.id,
                                transferDetails: JSON.stringify(data),
                                accountId:
                                    data.payload.transfer.entity.recipient,
                                status: 'Processed'
                            },
                            data.payload.transfer.entity.source
                        );
                    }
                    break;
                case 'transfer.failed':
                    if (
                        data &&
                        data.payload &&
                        data.payload.transfer &&
                        data.payload.transfer.entity &&
                        data.payload.transfer.entity.id &&
                        data.payload.transfer.entity.amount &&
                        data.payload.transfer.entity.source &&
                        data.payload.transfer.entity.recipient &&
                        data.payload.transfer.entity.error &&
                        data.payload.transfer.entity.error.description
                    ) {
                        await TransferRepository.updateTransfer(
                            {
                                transferId: data.payload.transfer.entity.id,
                                transferDetails: JSON.stringify(data),
                                accountId:
                                    data.payload.transfer.entity.recipient,
                                status: 'Failed',
                                error: data.payload.transfer.entity.error
                                    .description
                            },
                            data.payload.transfer.entity.source
                        );
                    }
                    break;
                case 'settlement.processed':
                    const bankDetails = await BankDetail.findOne({
                        where: {
                            accountId: data.account_id
                        },
                        raw: true
                    });

                    console.log(
                        'checking settlement',
                        bankDetails,
                        data.payload.settlement
                    );

                    const [settlemnet, transfers] = await Promise.all([
                        SettlementDetails.create({
                            bankId: bankDetails?.id || 0,
                            accountId: data.account_id,
                            amount: data.payload.settlement.entity.amount,
                            utr: data.payload.settlement.entity.utr,
                            settlementId: data.payload.settlement.entity.id,
                            status: data.payload.settlement.entity.status
                        }),
                        razorpayService.getTransfersFromSettlements(
                            data.payload.settlement.entity.id
                        )
                    ]);

                    console.log(transfers);

                    transfers.items.length &&
                        (await Promise.all(
                            transfers.items.map((transfer) =>
                                TransferDetails.update(
                                    {
                                        status: transfer.settlement_status,
                                        settlementId:
                                            settlemnet['dataValues'].id
                                    },
                                    {
                                        where: {
                                            transferId: transfer.id
                                        }
                                    }
                                )
                            )
                        ));
                    break;
                default:
                    break;
            }
            return true;
        } catch (err) {
            console.log('Error in webhook', err);
            return new ResponseBuilder(400, {}, 'Webhook Failed');
        }
    }

    async updatePaymentStatusviaWebhookTest(data: any) {
        try {
            let payment = await PaymentRepository.getPaymentByTransactionId(
                data.order_id
            );
            console.log('payment in webhook', payment);

            if (!payment || payment.status === 'Success') {
                return false;
            }
            console.log('payment data', data.id);
            switch (data.event) {
                case 'payment.captured':
                    const isAlreadyJoined = null;

                    await PaymentRepository.updatePayment(
                        {
                            paymentId: data.id,
                            paymentDetails: JSON.stringify({
                                process: process.pid
                            }),
                            status: 'Success',
                            updatedBy: 'webhook',
                            paymentStatus: 'success',
                            renewed: isAlreadyJoined ? 1 : 0
                        },
                        payment.id,
                        payment.buyerId
                    );
                    await TransferRepository.createTransfer({
                        amount: data.amount,
                        orderId: data.order_id,
                        userId: payment.sellerId
                    });

                    console.log('giving access');

                    await this.giveAccessForPaymentTest(payment);

                    // await RedisManager.addToHashmap(payment.transactionId, {
                    //     status: 'Success',

                    //     paymentStatus: 'success'
                    // });

                    break;
                case 'payment.failed':
                    await PaymentRepository.updatePayment(
                        {
                            paymentId: data.payload.payment.entity.id,
                            paymentDetails: JSON.stringify(data),
                            status: 'Failed',
                            error: data.payload.payment.entity
                                .error_description,
                            updatedBy: 'webhook',
                            paymentStatus: 'failed'
                        },
                        payment.id,
                        payment.buyerId
                    );
                    // await RedisManager.addToHashmap(payment.transactionId, {
                    //     status: 'Failed',

                    //     paymentStatus: 'failed'
                    // });

                    break;
                case 'payment.authorized':
                    await PaymentRepository.updatePayment(
                        {
                            paymentId: data.payload.payment.entity.id,
                            paymentDetails: JSON.stringify(data),
                            status: 'Pending',
                            updatedBy: 'webhook'
                        },
                        payment.id,
                        payment.buyerId
                    );
                    break;
                case 'transfer.processed':
                    if (
                        data &&
                        data.payload &&
                        data.payload.transfer &&
                        data.payload.transfer.entity &&
                        data.payload.transfer.entity.id &&
                        data.payload.transfer.entity.amount &&
                        data.payload.transfer.entity.source &&
                        data.payload.transfer.entity.recipient
                    ) {
                        await TransferRepository.updateTransfer(
                            {
                                transferId: data.payload.transfer.entity.id,
                                transferDetails: JSON.stringify(data),
                                accountId:
                                    data.payload.transfer.entity.recipient,
                                status: 'Processed'
                            },
                            data.payload.transfer.entity.source
                        );
                    }
                    break;
                case 'transfer.failed':
                    if (
                        data &&
                        data.payload &&
                        data.payload.transfer &&
                        data.payload.transfer.entity &&
                        data.payload.transfer.entity.id &&
                        data.payload.transfer.entity.amount &&
                        data.payload.transfer.entity.source &&
                        data.payload.transfer.entity.recipient &&
                        data.payload.transfer.entity.error &&
                        data.payload.transfer.entity.error.description
                    ) {
                        await TransferRepository.updateTransfer(
                            {
                                transferId: data.payload.transfer.entity.id,
                                transferDetails: JSON.stringify(data),
                                accountId:
                                    data.payload.transfer.entity.recipient,
                                status: 'Failed',
                                error: data.payload.transfer.entity.error
                                    .description
                            },
                            data.payload.transfer.entity.source
                        );
                    }
                    break;
                default:
                    break;
            }
            return true;
        } catch (err) {
            return new ResponseBuilder(400, {}, 'Webhook Failed');
        }
    }

    async updatePaymentStatus(data: any) {
        console.log('update Order api data', data);
        if (!data.payload) {
            let payment = await PaymentRepository.getPaymentByTransactionId(
                data.razorpay_order_id
            );
            console.log('payment', payment);
            if (!payment) {
                return new ResponseBuilder(400, {}, 'Payment not found');
            }
            const isAlreadyJoined =
                await MemberGroupMapRepository.hasMemberJoinedGroupAndAdded(
                    payment.groupId,
                    payment.buyerId
                );
            if (payment.status == 'Success') {
                // if webhook marked as success,
                // TODO: Nikhil ye check kar lena
                return;
                // const member =
                //     await MemberGroupMapRepository.hasMemberJoinedGroup2(
                //         payment.groupId,
                //         payment.buyerId
                //     );
                // if (member.length && member[0].inviteLink) {
                //     return new ResponseBuilder(
                //         200,
                //         {
                //             status: 'success'
                //         },
                //         'Payment successful'
                //     );
                // }

                // const transfer = await TransferRepository.findTransfer({
                //     orderId: payment.transactionId
                // });

                // !transfer &&
                //     (await TransferRepository.createTransfer({
                //         amount: payment.amount,
                //         orderId: payment.transactionId,
                //         userId: payment.sellerId
                //     }));
                // let resp = await this.giveAccessForPayment(payment);
                // return new ResponseBuilder(
                //     200,
                //     {
                //         status: 'success',
                //         ...resp
                //     },
                //     'Payment successful'
                // );
                //
                // if (payment.orderType == 'group') {
                //     let group = await GroupDetailsRepository.findGroupById(
                //         payment.groupId
                //     );
                //     return new ResponseBuilder(
                //         200,
                //         {
                //             status: 'success',
                //             groupName: group.groupName,
                //             groupLink: group.channelId
                //         },
                //         'Payment successful'
                //     );
                // }
                // if (payment.orderType == 'message') {
                //     let messsge = await messageService.findMessageById(
                //         payment.messageId
                //     );
                //     return new ResponseBuilder(
                //         200,
                //         {
                //             status: 'success',
                //             groupName: messsge.title,
                //             groupLink: messsge.channelId
                //         },
                //         'Payment successful'
                //     );
                // }
            }
            // TODO:

            let rzpPayment: any = await RZPService.getPaymnet(
                data.razorpay_payment_id
            );

            console.log('rzpPayment', rzpPayment);
            if (!rzpPayment || rzpPayment.status === 'failed') {
                await PaymentRepository.updatePayment(
                    {
                        paymentDetails: JSON.stringify(rzpPayment),
                        status: 'Failed',
                        error: rzpPayment.error_description,
                        updatedBy: 'api',
                        paymentId: rzpPayment.id,
                        paymentStatus: 'failed'
                    },
                    payment.id,
                    payment.buyerId
                );
                return new ResponseBuilder(
                    200,
                    {
                        status: 'failiure'
                    },
                    'Payment failed'
                );
            }
            if (rzpPayment.status === 'captured') {
                await PaymentRepository.updatePayment(
                    {
                        paymentId: rzpPayment.id,
                        paymentDetails: JSON.stringify(rzpPayment),
                        status: 'Success',
                        updatedBy: 'api',
                        paymentStatus: 'success',
                        renewed: isAlreadyJoined ? 1 : 0
                    },
                    payment.id,
                    payment.buyerId
                );
                const transfer = await TransferRepository.findTransfer({
                    orderId: payment.transactionId
                });

                !transfer &&
                    (await TransferRepository.createTransfer({
                        amount: payment.amount,
                        orderId: payment.transactionId,
                        userId: payment.sellerId
                    }));
                let resp = await this.giveAccessForPayment(payment);
                return new ResponseBuilder(
                    200,
                    {
                        status: 'success',
                        ...resp
                    },
                    'Payment successful'
                );
            }
            if (rzpPayment.status === 'authorized') {
                await PaymentRepository.updatePayment(
                    {
                        paymentId: rzpPayment.id,
                        paymentDetails: JSON.stringify(rzpPayment),
                        status: 'Pending',
                        updatedBy: 'api'
                    },
                    payment.id,
                    payment.buyerId
                );
                return new ResponseBuilder(
                    200,
                    {
                        status: 'pending'
                    },
                    'Payment on hold'
                );
            }
        } else {
            let payment = await PaymentRepository.getPaymentByOrderId(
                data.payload.payment.entity.order_id
            );

            if (!payment) {
                return false;
            }
            const isAlreadyJoined =
                await MemberGroupMapRepository.hasMemberJoinedGroupAndAdded(
                    payment.groupId,
                    payment.buyerId
                );
            switch (data.event) {
                case 'payment.captured':
                    if (['Success', 'Failiure'].indexOf(payment.status) != -1) {
                        return true;
                    }
                    if (
                        data &&
                        data.payload &&
                        data.payload.payment &&
                        data.payload.payment.entity &&
                        data.payload.payment.entity.notes &&
                        data.payload.payment.entity.id &&
                        data.payload.payment.entity.amount &&
                        data.payload.payment.entity.orderId
                    ) {
                        await PaymentRepository.updatePayment(
                            {
                                paymentId: data.payload.payment.entity.id,
                                paymentDetails: JSON.stringify(data),
                                status: 'Success',
                                renewed: isAlreadyJoined ? 1 : 0
                            },
                            payment.id,
                            payment.buyerId
                        );
                        await TransferRepository.createTransfer({
                            amount: data.payload.payment.entity.amount,
                            orderId: data.payload.payment.entity.orderId,
                            userId: payment.sellerId
                        });

                        await this.giveAccessForPayment(payment);

                        return true;
                    }
                    break;
                case 'payment.failed':
                    if (['Success', 'Failiure'].indexOf(payment.status) != -1) {
                        return true;
                    }
                    if (
                        data &&
                        data.payload &&
                        data.payload.payment &&
                        data.payload.payment.entity &&
                        data.payload.payment.entity.notes &&
                        data.payload.payment.entity.orderId
                    ) {
                        await PaymentRepository.updatePayment(
                            {
                                paymentDetails: JSON.stringify(data),
                                status: 'Failiure',
                                error: data.payload.payment.entity
                                    .error_description
                            },
                            payment.id,
                            payment.buyerId
                        );
                    }
                    break;
                case 'transfer.processed':
                    if (
                        data &&
                        data.payload &&
                        data.payload.transfer &&
                        data.payload.transfer.entity &&
                        data.payload.transfer.entity.id &&
                        data.payload.transfer.entity.amount &&
                        data.payload.transfer.entity.source &&
                        data.payload.transfer.entity.recipient
                    ) {
                        await TransferRepository.updateTransfer(
                            {
                                transferId: data.payload.transfer.entity.id,
                                transferDetails: JSON.stringify(data),
                                accountId:
                                    data.payload.transfer.entity.recipient,
                                status: 'Processed'
                            },
                            data.payload.transfer.entity.source
                        );
                    }
                    break;
                case 'transfer.failed':
                    if (
                        data &&
                        data.payload &&
                        data.payload.transfer &&
                        data.payload.transfer.entity &&
                        data.payload.transfer.entity.id &&
                        data.payload.transfer.entity.amount &&
                        data.payload.transfer.entity.source &&
                        data.payload.transfer.entity.recipient &&
                        data.payload.transfer.entity.error &&
                        data.payload.transfer.entity.error.description
                    ) {
                        await TransferRepository.updateTransfer(
                            {
                                transferId: data.payload.transfer.entity.id,
                                transferDetails: JSON.stringify(data),
                                accountId:
                                    data.payload.transfer.entity.recipient,
                                status: 'Failed',
                                error: data.payload.transfer.entity.error
                                    .description
                            },
                            data.payload.transfer.entity.source
                        );
                    }
                    break;
                default:
                    break;
            }
            return true;
        }
    }

    async updatePaymentStatusViaApi(data: any) {
        console.log('update Order api data', data);
        // fetch from redis
        // let redisPayment = await RedisManager.getFromHashmap(data.razorpay_order_id)
        // if(!redisPayment)

        let payment = await PaymentRepository.getPaymentByTransactionId(
            data.razorpay_order_id
        );

        console.log('payment', payment);
        if (!payment) {
            return new ResponseBuilder(400, {}, 'Payment not found');
        }

        if (payment.paymentStatus == 'success') {
            // fetch link from db and send
            const member = await MemberGroupMapRepository.hasMemberJoinedGroup2(
                payment.groupId,
                payment.buyerId
            );
            if (member.length) {
                let resp = await this.craftResponseForPayment(
                    payment,
                    member[0]
                );
                if (!resp) {
                    return new ResponseBuilder(
                        200,
                        {
                            status: 'pending',
                            orderId: payment.orderId
                        },
                        'Payment in progress'
                    );
                }
                return new ResponseBuilder(
                    200,
                    {
                        status: 'success',
                        ...resp,
                        orderId: payment.orderId
                    },
                    'Payment successful'
                );
            }
        } else if (payment.paymentStatus == 'failed') {
            // failed response
            return new ResponseBuilder(
                200,
                {
                    status: 'failed',
                    orderId: payment.orderId
                },
                'Payment failed'
            );
        } else {
            // async update in db as Attempted and pending screen
            payment.status == 'Initiated' &&
                PaymentRepository.updatePayment(
                    { status: 'Attempted' },
                    payment.id,
                    payment.buyerId
                );
            return new ResponseBuilder(
                200,
                {
                    status: 'pending',
                    orderId: payment.orderId
                },
                'Payment in progress'
            );
        }

        return new ResponseBuilder(
            200,
            {
                status: 'pending',
                orderId: payment.orderId
            },
            'Payment in progress'
        );

        // TODO://
        // if (['Success', 'Failed'].indexOf(payment.status) != -1) {
        //     if (payment.status === 'Failed') {
        //         return new ResponseBuilder(
        //             200,
        //             {
        //                 status: 'failed',
        //                 orderId: payment.orderId
        //             },
        //             'Payment failed'
        //         );
        //     }
        //     // if webhook marked as success,
        //     const member = await MemberGroupMapRepository.hasMemberJoinedGroup2(
        //         payment.groupId,
        //         payment.buyerId
        //     );
        //     if (member.length) {
        //         let resp = await this.craftResponseForPayment(
        //             payment,
        //             member[0]
        //         );
        //         if (!resp) {
        //             return new ResponseBuilder(
        //                 200,
        //                 {
        //                     status: 'pending',
        //                     orderId: payment.orderId
        //                 },
        //                 'Payment in progress'
        //             );
        //         }
        //         return new ResponseBuilder(
        //             200,
        //             {
        //                 status: 'success',
        //                 ...resp,
        //                 orderId: payment.orderId
        //             },
        //             'Payment successful'
        //         );
        //     }
        // }
        // return new ResponseBuilder(
        //     200,
        //     {
        //         status: 'pending',
        //         orderId: payment.orderId
        //     },
        //     'Payment in progress'
        // );
    }

    async checkOrderStatus(groupId, messageId, userId, freemium = 0) {
        console.log(freemium, 'freemium');
        const user = await userRepository.findOneById(userId);
        const response = {
            paymentDone: false,
            addedToGroup: false,
            inviteLink: null,
            alreadyPurchased: false,
            isLifetimeSubscription: false,
            // telegramUserName: user.telegramUsername,
            userDetails: user,
            title: 'dummy'
        };
        if (messageId) {
            const includes = {
                include: {
                    model: LockedMessage,
                    as: 'messageDetails',
                    required: true
                }
            };
            const memberShipDetails =
                await MemberService.checkMessageMembership(
                    userId,
                    messageId,
                    {},
                    includes
                );
            if (memberShipDetails && memberShipDetails.data) {
                response['paymentDone'] = true;
                response['title'] =
                    memberShipDetails.data['messageDetails.title'];
            }
            if (
                memberShipDetails &&
                memberShipDetails.data &&
                memberShipDetails.isAdded
            ) {
                response['addedToGroup'] = true;
            }
        } else if (groupId) {
            const filter = {
                groupId,
                memberId: userId
            };
            const projection = [
                'id',
                'isAdded',
                'isActive',
                'status',
                'groupName',
                'inviteLink',
                'currentPlan',
                'memberStatus',
                'isLeft'
            ];
            let [memberShipDetails, groupDetails] = await Promise.all([
                MemberGroupMapRepository.getJoinedGroup(filter, projection),
                groupRepository.findGroup({ id: groupId })
            ]);

            if (!groupDetails) {
                return new ResponseBuilder(
                    400,
                    {},
                    'Please provide valid group id'
                );
            }

            const existingPendingOrder =
                await PaymentRepository.getPaymentByFilter(
                    {
                        groupId,
                        buyerId: userId
                    },
                    freemium
                );
            if (
                existingPendingOrder &&
                existingPendingOrder.paymentStatus == null
            ) {
                // const latestStatus = await RZPService.getOrderStatus(
                //     existingPendingOrder.transactionId
                // );
                response['orderId'] = existingPendingOrder.orderId;
                response['latestOrderStatus'] = 'Attempted';
                console.log(
                    'existingOrder',
                    existingPendingOrder.orderId
                    // latestStatus.status
                );
                // show, "Your payment is already success, if not received link yet, we wills end it shortly"
                // Run script manually for this order id
                // run craftResponse wala code
                // return same success response of link here
                // Not Paid then only proceed for payment again else if paid, decide on processing link here
                // check case for renewal
            } else {
                console.log(existingPendingOrder);
                response['orderId'] = existingPendingOrder?.orderId || null;
                response['latestOrderStatus'] =
                    existingPendingOrder?.orderId == 'freemium'
                        ? 'FreemiumAvailed'
                        : null;
                const encryptMember = await memberService.getEncryptedmember(
                    String(userId)
                );
                const encryptGroup = await memberService.getEncryptedGroup(
                    String(groupId)
                );
                response[
                    'preauthLink'
                ] = `${process.env.PAYMENT_DOMAIN}/pay/${encryptMember}fnkp${encryptGroup}`;
            }
            if (memberShipDetails && memberShipDetails.length) {
                response['paymentDone'] = true;
                response['title'] = memberShipDetails[0].groupName;
                response['memberStatus'] = memberShipDetails[0].memberStatus;
                response['inviteLink'] = memberShipDetails[0].inviteLink;
                const myPlan =
                    memberShipDetails[0].currentPlan !== '' &&
                    JSON.parse(memberShipDetails[0].currentPlan);
                response['isLifetimeSubscription'] =
                    myPlan && myPlan.selectedPeriod === 'Lifetime';
            }
            if (
                memberShipDetails &&
                memberShipDetails.length &&
                memberShipDetails[0].status === 'success'
            ) {
                response['addedToGroup'] = true;
            }
            if (memberShipDetails && memberShipDetails.length) {
                const myPlan =
                    memberShipDetails[0].currentPlan !== '' &&
                    JSON.parse(memberShipDetails[0].currentPlan);

                response['alreadyPurchased'] =
                    memberShipDetails[0].status != 'migrating'
                        ? memberShipDetails[0].currentPlan !== ''
                            ? Boolean(
                                  (memberShipDetails[0].isAdded == 1 &&
                                      memberShipDetails[0].isActive == 0) ||
                                      (memberShipDetails[0].isAdded == 1 &&
                                          memberShipDetails[0].isActive == 1 &&
                                          myPlan.selectedPeriod == 'Lifetime')
                              )
                            : false
                        : true;

                const decideOnLeft = Boolean(memberShipDetails[0].inviteLink);
                if (
                    groupDetails.type == 'telegramChannel' ||
                    groupDetails.type == 'telegramExisting'
                ) {
                    response['alreadyPurchased'] = !memberShipDetails[0].isLeft
                        ? response['alreadyPurchased']
                        : decideOnLeft;
                }

                response['status'] = memberShipDetails[0].status;
                response['formLink'] = groupDetails.formLink;
                response['conditionalApproval'] =
                    groupDetails.conditionalApproval;
                response['type'] = groupDetails.type;
                response['existsInGroup'] =
                    memberShipDetails[0].memberStatus == 'renewed';
            }
            if (!memberShipDetails || !memberShipDetails.length) {
                response['existsInGroup'] = false;
            }
        }

        return new ResponseBuilder(200, response, 'Ok');
    }

    async rzpWebhook(data: any, razorpaySignature: string) {
        const payload = {
            data,
            razorpaySignature
        };

        const key = process.env.RAZORPAY_WEBHOOK_SECRET;
        const expectedSignature = crypto
            .createHmac('sha256', key)
            .update(JSON.stringify(data))
            .digest('hex');
        console.info('Rzpay webhook ::', JSON.stringify(data));
        // process.env.ENVIRONMENT === 'production' &&
        //     sendNotificationToGoogleChat(RAZORPAY_CHAT_URL, {
        //         source: 'RAZORPAY LOGS',
        //         data: JSON.stringify(data)
        //     });
        (data.event === 'settlement.processed' ||
            data.event === 'transfer.processed') &&
            sendNotificationToGoogleChat(RAZORPAY_CHAT_URL, {
                source: 'RAZORPAY LOGS',
                data: JSON.stringify(data)
            });
        if (expectedSignature != razorpaySignature) {
            console.error('Razorpay Fankonnect webhook authentication error');
            return new ResponseBuilder(400, {}, 'Signature mismatch');
        }

        // if (
        //     !data ||
        //     !data.payload ||
        //     !data.payload.payment ||
        //     !data.payload.payment.entity ||
        //     !data.payload.payment.entity.notes ||
        //     !data.payload.payment.entity.id ||
        //     !data.payload.payment.entity.amount ||
        //     !data.payload.payment.entity.order_id
        // ) {
        //     return new ResponseBuilder(400, {}, 'Bad Request');
        // }

        PubSubService.sendMessage(payload, process.env.PUBSUB_WEBHOOK_TOPIC, {
            type: 'webhookEvent'
        });
        // let resp = await this.updatePaymentStatusviaWebhook(data);
        // console.log('payment status update resp', resp);
        return new ResponseBuilder(200, { success: true }, 'Success');

        // // await PubSubService.sendMessage(
        // // 	data,
        // // 	process.env.RAZORPAY_WEBHOOK_TOPIC_CONTENT_TOPIC,
        // // )
    }

    // async rzpWebhookTest(concurrency: number, limit: number, seconds: number) {
    //     const rows = await PaymentRepository.getPaymentByOrderIdTest('test');
    //     console.log('Total Rows', rows.length, seconds);
    //     const x = new Date();
    //     for (let i = 0; i < rows.length; i += concurrency) {
    //         await telegram.sleep(seconds * 200);
    //         for (const item of rows.slice(i, i + concurrency)) {
    //             await telegram.sleep(100);
    //             const data = {
    //                 order_id: item.transactionId,
    //                 amount: item.amount,
    //                 id: item.id,
    //                 event: 'payment.captured'
    //             };
    //             const payload = {
    //                 data
    //             };

    //             PubSubService.sendMessage(
    //                 payload,
    //                 process.env.PUBSUB_WEBHOOK_TOPIC,
    //                 {
    //                     type: 'webhookTest'
    //                 }
    //             );
    //         }

    //         // rows.slice(i, i + concurrency).forEach((item) => {
    //         //     const data = {
    //         //         order_id: item.transactionId,
    //         //         amount: item.amount,
    //         //         id: item.id,
    //         //         event: 'payment.captured'
    //         //     };
    //         //     const payload = {
    //         //         data
    //         //     };

    //         //     PubSubService.sendMessage(
    //         //         payload,
    //         //         process.env.PUBSUB_WEBHOOK_TOPIC,
    //         //         {
    //         //             type: 'webhookTest'
    //         //         }
    //         //     );
    //         // });
    //     }
    //     return new ResponseBuilder(
    //         200,
    //         {
    //             success: true,
    //             delay: Math.abs((new Date().getTime() - x.getTime()) / 1000)
    //         },
    //         'Success'
    //     );

    //     // let resp = await this.updatePaymentStatusviaWebhook(data);
    //     // console.log('payment status update resp', resp);
    //     return new ResponseBuilder(200, { success: true }, 'Success');

    //     // // await PubSubService.sendMessage(
    //     // // 	data,
    //     // // 	process.env.RAZORPAY_WEBHOOK_TOPIC_CONTENT_TOPIC,
    //     // // )
    // }

    async rzpWebhookHandler(data: any, razorpaySignature: string) {
        try {
            await RedisManager.incrCount('webhookEvent');
            // const key = process.env.RAZORPAY_WEBHOOK_SECRET;
            // const expectedSignature = crypto
            //     .createHmac('sha256', key)
            //     .update(JSON.stringify(data))
            //     .digest('hex');
            // console.info('Rzpay webhook ::', JSON.stringify(data));
            // process.env.ENVIRONMENT === 'production' &&
            //     sendNotificationToGoogleChat(RAZORPAY_CHAT_URL, {
            //         source: 'RAZORPAY LOGS',
            //         data: JSON.stringify(data)
            //     });
            // if (expectedSignature != razorpaySignature) {
            //     console.error(
            //         'Razorpay Fankonnect webhook authentication error'
            //     );
            //     return false;
            // }

            // if (
            //     !data ||
            //     !data.payload ||
            //     !data.payload.payment ||
            //     !data.payload.payment.entity ||
            //     !data.payload.payment.entity.notes ||
            //     !data.payload.payment.entity.id ||
            //     !data.payload.payment.entity.amount ||
            //     !data.payload.payment.entity.order_id
            // ) {
            //     return false;
            // }

            (data.event === 'transfer.settled' ||
                data.event === 'settlement.processed') &&
                sendNotificationToGoogleChat(RAZORPAY_CHAT_URL, {
                    source: 'RAZORPAY LOGS',
                    data: JSON.stringify(data)
                });
            let resp = await this.updatePaymentStatusviaWebhook(data);
            console.log('payment status update resp', resp);
            // await PubSubService.sendMessage(
            // 	data,
            // 	process.env.RAZORPAY_WEBHOOK_TOPIC_CONTENT_TOPIC,
            // )
            await RedisManager.decrCount('webhookEvent');

            return true;
        } catch (err) {
            console.log('err in webhook process', err.message);
            return err;
        }
    }

    async rzpWebhookHandlerTest(data: any) {
        try {
            await RedisManager.incrCount('webhookTest');

            let resp = await this.updatePaymentStatusviaWebhookTest(data);
            console.log('payment status update resp', resp);
            // await PubSubService.sendMessage(
            // 	data,
            // 	process.env.RAZORPAY_WEBHOOK_TOPIC_CONTENT_TOPIC,
            // )
            await RedisManager.decrCount('webhookTest');

            return true;
        } catch (err) {
            console.log('err in webhook process', err.message);
            return err;
        }
    }

    async manualPaymentCheck(
        groupId: number,
        offset: number,
        limit: number,
        interval: number,
        intervalType: string,
        status: string,
        date: string,
        cron?: boolean
    ) {
        const bulkPaymentsCheck: any = await sequelize.query(
            cron
                ? `
		SELECT * FROM payment_table WHERE status IN ('Pending','Attempted') AND paymentStatus IS NULL AND transactionId is NOT NULL AND createdAt < date_sub(now(), INTERVAL ${interval} ${intervalType})`
                : `
			SELECT * FROM payment_table WHERE status='${status}' AND transactionId is NOT NULL AND createdAt < date_sub(now(), INTERVAL ${interval} ${intervalType}) AND DATE(createdAt) = '${date}'`,
            {
                type: QueryTypes.SELECT,
                logging: true
            }
        );

        console.log(
            'bulk payment to be checked count',
            bulkPaymentsCheck.length
        );
        let success = 0;
        for (let i = 0; i < bulkPaymentsCheck.length; i++) {
            if (bulkPaymentsCheck[i] && !bulkPaymentsCheck[i].transactionId) {
                console.log('transactionId not found');
                continue;
            }
            let rzpPayment: any = await RZPService.getPaymnets(
                bulkPaymentsCheck[i].transactionId
            );
            if (!rzpPayment) {
                continue;
            }
            console.log('rzp Bulk Payment', rzpPayment);
            await this.updatePaymentStatus({
                ...bulkPaymentsCheck[0],
                payload: null,
                razorpay_order_id: bulkPaymentsCheck[i].transactionId,
                razorpay_payment_id: rzpPayment.id
            });
            success += 1;
            console.log('BULK PROCESSING SUCCESS', success);
            await telegram.sleep(2000);
        }
        console.log('success-check', success);
    }

    async updateRenewedStatus(limit: number, offset: number) {
        const members = await MemberGroupMap.findAll({
            where: {
                status: 'success'
            },
            limit: limit,
            offset: offset,
            order: [['updatedAt', 'DESC']],
            attributes: ['groupId', 'memberId']
        });

        console.log(
            'members',
            members.map((member) => member.groupId)
        );

        for (let i = 0; i < members.length; i++) {
            const payments = await PaymentTable.findAll({
                where: {
                    groupId: members[i].groupId,
                    buyerId: members[i].memberId,
                    status: 'Success'
                },
                order: [['updatedAt', 'DESC']],
                attributes: ['id']
            });
            payments.pop();
            console.log(
                'payments',
                payments.map((payment) => payment.id)
            );
            if (!payments.length) {
                continue;
            }
            await Promise.allSettled(
                payments.map((payment) =>
                    PaymentTable.update(
                        {
                            renewed: 1
                        },
                        {
                            where: {
                                id: payment.id
                            }
                        }
                    )
                )
            );
        }
        return true;
    }

    async receiptCron() {
        try {
            const pendingReceipts: any = await sequelize.query(
                `SELECT pt.id, pt.sellerId, pt.amount, pt.createdAt, pt.orderId, pt.renewed, pt.extended, pt.buyerId, pt.couponDiscount, pt.currentPlan, pt.planDiscount, mgm.inviteLink, mgm.groupName, u.name, u.mobile, u.email, u.state, gd.conditionalApproval, gd.formLink FROM payment_table pt JOIN group_details gd ON gd.id=pt.groupId JOIN member_group_map mgm ON mgm.paymentId=pt.id JOIN users u ON u.id=pt.buyerId JOIN receipt_details rc ON rc.userId=pt.sellerId  WHERE DATE(pt.createdAt)>='2022-10-28' AND paymentStatus='success' AND invoiceLink IS NULL AND rc.isActive=1 AND rc.invoiceEnabled=1 AND pt.orderId<>'freemium' ORDER BY pt.createdAt ASC LIMIT 10;`,
                { type: QueryTypes.SELECT }
            );
            console.log('Pending invoices', pendingReceipts);

            for (let payment of pendingReceipts) {
                await groupService.sendMailWithInvoice(
                    payment.id,
                    {
                        name: payment.name,
                        email: payment.email,
                        mobile: payment.mobile,
                        state: payment.state
                    },
                    payment.amount,
                    null,
                    payment
                );
            }
            console.log('cron ended');
        } catch (err) {
            console.log('err in invoice cron', err);
        }
    }

    async receiptScriptForBackGeneration() {
        try {
            const pendingReceipts: any = await sequelize.query(
                `SELECT pt.id, pt.sellerId, pt.amount, pt.createdAt, pt.orderId, pt.renewed, pt.extended, pt.buyerId, pt.couponDiscount, pt.currentPlan, pt.planDiscount, mgm.inviteLink, mgm.groupName, 
				u.name, u.mobile, u.email, u.state, gd.conditionalApproval, gd.formLink 
				FROM payment_table pt 
				JOIN group_details gd ON gd.id=pt.groupId 
				JOIN member_group_map mgm ON mgm.paymentId=pt.id 
				JOIN users u ON u.id=pt.buyerId 
				WHERE  paymentStatus='success' AND invoiceLink IS NULL AND pt.orderId<>'freemium' AND pt.migrated IS NULL ORDER BY pt.createdAt ASC LIMIT 10;`,
                { type: QueryTypes.SELECT }
            );
            console.log('Pending invoices', pendingReceipts);

            for (let payment of pendingReceipts) {
                await groupService.sendMailWithInvoice(
                    payment.id,
                    {
                        name: payment.name,
                        email: payment.email,
                        mobile: payment.mobile,
                        state: payment.state,
                        manual: 1
                    },
                    payment.amount,
                    null,
                    payment
                );
            }
            console.log('cron ended');
        } catch (err) {
            console.log('err in invoice cron', err);
        }
    }
}

export default new orderService();
