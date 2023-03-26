const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import orderServiceV2 from '../services/order.service.v2';
import { ERROR_500 } from '../../../../config/constants/errorMessages';

export default class rzpLinksWebhook extends MasterController {
    static doc() {
        return {
            tags: ['payment'],
            description: 'Razorpay Links Webhook',
            summary: 'Razorpay Links Webhook'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(Joi.object().required());
        return payload;
    }

    async controller() {
        try {
            console.log('Inside razorpay Links webhook');
            const razorpaySignature = this.req.headers['x-razorpay-signature'];
            let response = await orderServiceV2.rzpLinksWebhook(
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
