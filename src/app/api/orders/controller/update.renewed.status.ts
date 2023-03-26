const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import orderService from '../services/orders.service';
import {
    ERROR_500,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';

export default class UpdateRenewedStatus extends MasterController {
    static doc() {
        return {
            tags: ['payment'],
            description: 'update payment renewed status',
            summary: 'update payment renewed status'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.number().required(),
                offset: Joi.number().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const { offset, limit } = this.data;
            await orderService.updateRenewedStatus(
                Number(limit),
                Number(offset)
            );
            return new ResponseBuilder(200, { success: true }, SUCCESS_200);
        } catch (e) {
            console.error('::Order Status:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
