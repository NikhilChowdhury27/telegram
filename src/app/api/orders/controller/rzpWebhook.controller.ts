const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import orderService from '../services/orders.service';
import { ERROR_500 } from '../../../../config/constants/errorMessages';

export default class rzpWebhook extends MasterController {
    static doc() {
        return {
            tags: ['payment'],
            description: 'Razorpay Webhook',
            summary: 'Razorpay Webhook'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(Joi.object().required());
        return payload;
    }

    async controller() {
        try {
            console.log('Inside razorpay webhook');
            const razorpaySignature = this.req.headers['x-razorpay-signature'];
            let response = await orderService.rzpWebhook(
                this.data,
                razorpaySignature
            );
            return response;
        } catch (e) {
            console.error('::Razorpay Webhook:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
