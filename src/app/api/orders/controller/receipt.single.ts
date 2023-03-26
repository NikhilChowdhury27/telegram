const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import orderServicev2 from '../services/order.service.v2';
import { ERROR_500 } from '../../../../config/constants/errorMessages';

export default class CreateReceiptController extends MasterController {
    static doc() {
        return {
            tags: ['payment'],
            description: 'create receipt',
            summary: 'create receipt'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                paymentId: Joi.number().min(1).required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await orderServicev2.createReceipt(this.data.paymentId);
        } catch (e) {
            console.error('::Create receipt:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
