/* eslint-disable complexity */
import CommonService from '../../../utils/common.service';
import { IorderPayload } from '../orders.interface';
import GroupDetailsRepository from '../../../repository/group.repository';
import TutorBankDetailRepository from '../../../repository/tutorBankDetails.repository';
import RZPService from './razorpay.service';
const { ResponseBuilder } = require('base-packages');
import PaymentRepository from '../../../repository/payment.repository';
import messageService from '../../messages/services/message.service';
import MemberService from '../../messageMembers/services/message.member';
import CouponService from '../../coupons/services/coupon.service';
import Coupons from '../../../../models/Coupon';
import GroupSubscriptionPlans from '../../../../models/GroupSubscriptionPlan';
import GroupPlanRepository from '../../../repository/group.subscription.plan';
import ordersService from './orders.service';
// import User from '../../../../models/User';
import CreatorInfo from '../../../../models/CreatorInfo';
import groupService from '../../groups/services/group';
import { sequelize } from '../../../../sequelize';
import { QueryTypes } from 'sequelize';
import {
    ERROR_400,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';
import User from '../../../../models/User';
import * as crypto from 'crypto';
import PubSubService from '../../../../app/consumers/gcp.pubsub.consumer';
import RedisManager from '../../../../config/conf/RedisCache';
import RazorpayLinksMapping from '../../../../models/razorpay_links_mapping';
import PaymentTable from '../../../../models/PaymentTable';
import * as moment from 'moment';
import TransferRepository from '../../../../app/repository/transfer.details.repository';
import GroupDetails from '../../../../models/GroupDetail';
// import razorpayService from './razorpay.service';

class orderServiceV2 extends CommonService {
    async createOrderV2(payload: IorderPayload) {
        let paymentAmount: number;
        let tutorId: number;
        let subscriptionPlan: GroupSubscriptionPlans;
        let couponPricing;
        let coupon;
        let userTakeRate;
        let userDetails;
        if (payload.orderType === 'group') {
            // TODO:
            // redis can be added here
            let [groupDetails, userInfo] = await Promise.all([
                GroupDetailsRepository.findGroupById(payload.groupId),
                User.findByPk(payload.userId, { attributes: ['email'] })
            ]);

            if (!userInfo) {
                return new ResponseBuilder(400, {}, 'User not found');
            }
            userDetails = userInfo;
            if (!groupDetails) {
                return new ResponseBuilder(400, {}, 'Group not found');
            }
            console.table(groupDetails);

            if (
                groupDetails.type == 'whatsappGroup' ||
                groupDetails.type == 'whatsappCommunity'
            ) {
                console.log('SETTING IN REDIS');
                this.waRateRedis(groupDetails.id);
            }

            userTakeRate = await CreatorInfo.findOne({
                where: {
                    userId: groupDetails['createdBy']
                },
                attributes: ['fankonnectCommisionPerc'],
                raw: true
            });
            // let period = payload.period;
            // const paymentPlans = JSON.parse(groupDetails['subscriptionPlan']);

            // if (period) {
            //     paymentAmount = subscriptionPlan['paymentPeriod']['price'];
            //     delete subscriptionPlan['accessPrice'];
            // } else {
            //     paymentAmount = subscriptionPlan['accessPrice'];
            //     subscriptionPlan['paymentPeriod'] = undefined;
            // }

            let planFilter = {
                groupId: groupDetails.id,
                selectedPeriod: payload.period,
                isDeleted: false
            };
            if (payload.periodTitle) {
                planFilter['periodTitle'] = payload.periodTitle;
            }

            // console.log(planFilter);

            subscriptionPlan = await GroupPlanRepository.findPlan(planFilter);

            // console.log(paymentPlans, period, payload.periodTitle);
            // if (period == 'Custom Period') {
            //     subscriptionPlan = paymentPlans.find(
            //         (plan) =>
            //             plan.selectedPeriod === period &&
            //             plan.periodTitle == payload.periodTitle
            //     );

            // 	subscriptionPlan = GroupSubscriptionPlans.
            // } else {
            //     subscriptionPlan = paymentPlans.find(
            //         (plan) => plan.selectedPeriod === period
            //     );
            // }
            // console.log('SUB-1', subscriptionPlan);

            if (!subscriptionPlan) {
                return new ResponseBuilder(400, {}, 'Payment plan not found');
            }
            if (payload.couponName) {
                [coupon, couponPricing] = await Promise.all([
                    Coupons.findOne({
                        where: {
                            groupId: payload.groupId,
                            name: payload.couponName
                        }
                    }),
                    CouponService.checkCouponValidity({
                        couponName: payload.couponName,
                        groupId: payload.groupId,
                        plan: subscriptionPlan
                    })
                ]);
            }

            paymentAmount = subscriptionPlan.price - subscriptionPlan.discount;
            console.log('coupon ---------', coupon, couponPricing);
            if (
                payload.couponName &&
                (!couponPricing.data.currentPlanData || !coupon)
            ) {
                return new ResponseBuilder(
                    400,
                    {
                        couponError: true
                    },
                    'Coupon not accepted , please try again'
                );
            }
            paymentAmount = payload.couponName
                ? couponPricing.data.currentPlanData.finalPrice
                : paymentAmount;
            // console.log('paymentAmount', paymentAmount);

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
            currentPlan: JSON.stringify(subscriptionPlan), // keeping the old data saving for now TODO:
            planId: subscriptionPlan.id,
            status: isFreemium ? 'Success' : null,
            paymentStatus: isFreemium ? 'success' : null,
            couponName: payload.couponName || '',
            couponDiscount:
                couponPricing && couponPricing.data
                    ? couponPricing.data.currentPlanData.couponDiscount
                    : 0,
            planDiscount:
                couponPricing && couponPricing.data
                    ? couponPricing.data.currentPlanData.planDiscount
                    : 0
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
                        userTakeRate.fankonnectCommisionPerc
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
                freemiumResponse = await ordersService.giveAccessForPayment(
                    payment
                );
            }
            return new ResponseBuilder(
                200,
                {
                    payload: response,
                    orderId: orderId,
                    freemiumCreateResponse: freemiumResponse,
                    email: userDetails.email
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

    async createReceipt(paymentId: number) {
        try {
            const payment: any = await sequelize.query(
                `SELECT pt.id, pt.sellerId, pt.amount, pt.createdAt, pt.orderId, pt.renewed, pt.extended, pt.buyerId, pt.couponDiscount, pt.currentPlan, pt.planDiscount, mgm.inviteLink, mgm.groupName, u.name, u.mobile, u.email, u.state FROM payment_table pt JOIN member_group_map mgm ON mgm.paymentId=pt.id JOIN users u ON u.id=pt.buyerId JOIN receipt_details rc ON rc.userId=pt.sellerId  WHERE pt.id=${paymentId};`,
                { type: QueryTypes.SELECT }
            );

            await groupService.sendMailWithInvoiceManual(
                payment[0].id,
                {
                    name: payment[0].name,
                    mobile: payment[0].mobile,
                    email: payment[0].email,
                    state: payment[0].state,
                    manual: 1
                },
                payment[0].amount,
                null,
                payment[0]
            );
            return new ResponseBuilder(
                200,
                { message: 'receipt generated' },
                SUCCESS_200
            );
        } catch (err) {
            return new ResponseBuilder(
                500,
                { message: err.message },
                'SOMETHING WENT WRONG'
            );
        }
    }

    async rzpLinksWebhook(data: any, razorpaySignature: string) {
        try {
            const key = process.env.RAZORPAY_WEBHOOK_SECRET;
            const expectedSignature = crypto
                .createHmac('sha256', key)
                .update(JSON.stringify(data))
                .digest('hex');
            console.info('Rzpay webhook ::', JSON.stringify(data));
            if (expectedSignature != razorpaySignature) {
                console.error(
                    'Razorpay Fankonnect webhook authentication error'
                );
                return new ResponseBuilder(400, {}, 'Signature mismatch');
            }
            PubSubService.sendMessage(data, process.env.PUBSUB_WEBHOOK_TOPIC, {
                type: 'webhookLinksEvent'
            });
            return new ResponseBuilder(200, { success: true }, 'Success');
        } catch (error) {
            return new ResponseBuilder(400, { error: error }, ERROR_400);
        }
    }

    async rzpLinksWebhookHandler(data: any) {
        try {
            await RedisManager.incrCount('webhookEvent');

            const paymentLinksData = await RazorpayLinksMapping.findOne({
                where: {
                    linkId: data.payload.payment_link.entity.id
                },
                raw: true
            });
            const paymentData = await PaymentTable.findOne({
                where: {
                    id: paymentLinksData.paymentId
                },
                raw: true
            });
            const groupDetails = await GroupDetails.findOne({
                where: {
                    id: paymentLinksData.groupId
                },
                raw: true
            });
            const creatorPercentage = await CreatorInfo.findOne({
                where: {
                    userId: groupDetails.createdBy
                },
                raw: true
            });
            let cpCommision =
                (paymentLinksData.amount *
                    Number(creatorPercentage.fankonnectCommisionPerc)) /
                100;
            let tutorAmount = paymentLinksData.amount - cpCommision;
            await PaymentTable.update(
                {
                    paymentId: data.payload.payment.entity.id,
                    paymentStatus: 'Success',
                    status: 'Success',
                    paymentDetails: JSON.stringify(data.payload.payment.entity),
                    transactionId: data.payload.payment.entity.order_id
                },
                {
                    where: {
                        id: paymentLinksData.paymentId
                    }
                }
            );

            await TransferRepository.createTransfer({
                amount: Number(tutorAmount),
                orderId: data.payload.payment.entity.order_id,
                userId: paymentData.sellerId
            });
            // console.log(paymentData);
            await groupService.joinPostLinkPayment({
                groupId: paymentLinksData.groupId,
                userId: paymentLinksData.userId,
                plan: '',
                amount: paymentLinksData.amount,
                paymentId: paymentLinksData.paymentId,
                expiryDate: paymentLinksData.expiryDate
            });
            await RedisManager.decrCount('webhookEvent');

            return true;
        } catch (err) {
            console.log('err in webhook process', err.message);
            return err;
        }
    }

    async waRateRedis(groupId: number) {
        try {
            const rateKey = `wa-${groupId}`;

            const rate = await RedisManager.getCount(rateKey);
            console.log('REDIS GET', rate);
            if (rate) {
                const getRate = JSON.parse(rate);
                const difference = (moment().unix() - getRate.startTime) / 60;
                if (difference < 1) {
                    getRate.count++;
                    RedisManager.setData(rateKey, JSON.stringify(getRate));
                    return;
                }
            }
            const setRate = {
                count: 1,
                startTime: moment().unix()
            };
            RedisManager.setData(rateKey, JSON.stringify(setRate));
        } catch (err) {
            console.log(err);
        }
    }
}

export default new orderServiceV2();
