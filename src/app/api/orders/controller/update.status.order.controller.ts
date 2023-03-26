const {
    MasterController,
    Joi,
    RequestBuilder,
    ResponseBuilder
} = require('base-packages');
import orderService from '../services/orders.service';
import { ERROR_500 } from '../../../../config/constants/errorMessages';

export default class updateOrderStatus extends MasterController {
    static doc() {
        return {
            tags: ['payment'],
            description: 'Update payment status',
            summary: 'Update payment status'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                razorpay_payment_id: Joi.string().required(),
                razorpay_order_id: Joi.string().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            let response = await orderService.updatePaymentStatusViaApi(
                this.data
            );
            return response;
        } catch (e) {
            console.error('::Update Order:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
