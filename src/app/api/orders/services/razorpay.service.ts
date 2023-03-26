import CommonService from '../../../utils/common.service';
const Razorpay = require('razorpay');
import * as moment from 'moment';
import PaymentRepository from '../../../repository/payment.repository';
const axios = require('axios');
// import PubSubService from '../../../consumers/gcp.pubsub.consumer';
// const { ResponseBuilder } = require('base-packages');

class RZPService extends CommonService {
    async createOrder(payload: any) {
        let tempTime = moment().add(6, 'hours');
        let holdTimeInMiliseconds = tempTime.valueOf();
        console.log('holdTimeInMiliseconds', holdTimeInMiliseconds);
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        let amount = payload.amount * 100;
        let currency = payload.currency;

        const options = {
            amount,
            currency,
            receipt: payload.orderId,
            payment: {
                capture: 'automatic',
                notes: {
                    orderId: payload.orderId,
                    orderType: payload.orderType,
                    userId: payload.userId
                },
                capture_options: {
                    automatic_expiry_period: 12,
                    manual_expiry_period: 12,
                    refund_speed: 'normal'
                }
            },
            transfers: await this.createTransfer(
                payload.accountId,
                amount,
                currency,
                holdTimeInMiliseconds,
                payload.paymentId,
                payload.userId,
                payload.fankonnectCommisionPerc
            )
        };
        console.log(
            'razorpay order creation payload :: ',
            JSON.stringify(options)
        );
        const response = await razorpay.orders.create(options);
        console.log('response of razorpay::', response);
        return response;
    }

    async getPaymnet(paymentId: string) {
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const response = await razorpay.payments.fetch(paymentId);
        console.log('response ::', response);
        return response;
    }

    async createTransfer(
        tutorAccountId,
        amount,
        currency,
        holdTimeInMiliseconds,
        paymentId,
        userId,
        fankonnectCommisionPerc
    ) {
        // let cp_percent = fankonnectCommisionPerc;
        let internetHandlingFee = process.env.INTERNET_HANDLING_FEE;
        let handlingfees = await this.getHandlingFee(
            amount,
            internetHandlingFee
        );
        // let actualAmount = amount - handlingfees;
        let cpCommision = (amount * Number(fankonnectCommisionPerc)) / 100;
        let tutorAmount = amount - cpCommision;
        console.log('amount in db ::: ', amount);
        console.log('cp_commission in db ::: ', cpCommision);
        console.log('handlingfees in db ::: ', handlingfees);
        console.log('tutor_amount in db ::: ', tutorAmount);
        console.log('actualAmount in db ::: ', amount, fankonnectCommisionPerc);
        await PaymentRepository.updatePayment(
            {
                fankonnectCommission: parseFloat(
                    String(cpCommision / 100)
                ).toFixed(2),
                razorpayCommission: 0
                // parseFloat(
                //     String(handlingfees / 100)
                // ).toFixed(2)
            },
            paymentId,
            userId
        );
        let transfer = [
            {
                account: tutorAccountId,
                amount: Math.floor(tutorAmount),
                currency,
                on_hold: 1,
                on_hold_until: Math.round(holdTimeInMiliseconds / 1000)
            }
        ];
        return transfer;
    }

    async getHandlingFee(amount: any, internetHandlingFee) {
        // handling fees = 2.6275
        console.log('handling fee calculation amount :::: ', amount);
        console.log(
            'handling fee calculation internetHandlingFee :::: ',
            internetHandlingFee
        );
        let handlingFee: any = Number(
            parseFloat(
                String((amount * Number(internetHandlingFee)) / 100)
            ).toFixed(2)
        );
        console.log('handling fee :::: ', handlingFee);
        return handlingFee;
    }

    async getPaymnets(paymentId: string) {
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        // instance.orders.fetchPayments(orderId)
        const response = await razorpay.orders.fetchPayments(paymentId);

        if (response && response.count === 0) {
            return false;
        }
        const payment = response.items.find((x) => x.status === 'captured');
        console.log('response ::', payment);
        return payment;
    }

    async getOrderStatus(orderId: string) {
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        // instance.orders.fetchPayments(orderId)
        const response = await razorpay.orders.fetch(orderId);

        return response;
    }
    async getTransfersFromSettlements(settlemnetId: string) {
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const response = await razorpay.transfers.all({
            recipient_settlement_id: settlemnetId
        });
        return response;
    }

    async generatePaymentLink(data: any) {
        try {
        } catch (error) {}
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log(data, `+${data.mobile}`);

        const link = await razorpay.paymentLink.create({
            amount: data.amount,
            currency: 'INR',
            accept_partial: false,
            reference_id: data.referenceId,
            description: data.description,
            customer: {
                name: data.name,
                contact: `+${data.mobile}`,
                email: data.email
            },
            notify: {
                sms: false,
                email: false
            },
            reminder_enable: false,
            options: {
                checkout: {
                    method: {
                        netbanking: true,
                        card: true,
                        upi: true,
                        wallet: false
                    }
                },
                order: {
                    transfers: data.transfer
                },
                hosted_page: {
                    label: {
                        description: 'Payment for',
                        amount_payable: 'Channel Fee Payable',
                        expire_by: 'Pay Before',
                        expired_on: 'Link Expired. Please contact Admin'
                    }
                }
            }
        });
        console.log('link', link);
        return link;
    }

    async cancelPaymentLink(linkId: string) {
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        return razorpay.paymentLink.cancel(linkId);
    }

    async getTransfersFromOrder(orderID: string) {
        try {
            const headersList = {
                Accept: '*/*',
                'Content-Type': 'application/json'
            };

            const teansfersData = {
                url: `https://api.razorpay.com/v1/orders/${orderID}/?expand[]=transfers`,
                method: 'GET',
                headers: headersList
            };
            return await axios.request(teansfersData);
        } catch (error) {
            console.log('Razorpay error', error);
        }
    }
}

export default new RZPService();
