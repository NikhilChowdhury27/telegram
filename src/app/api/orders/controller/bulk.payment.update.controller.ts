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

export default class checkBulkOrderStatus extends MasterController {
    static doc() {
        return {
            tags: ['check bulk payment status'],
            description: 'check payment status',
            summary: 'check bulk status'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                groupId: Joi.number().required(),
                limit: Joi.number().required(),
                offset: Joi.number().required(),
                interval: Joi.number().required(),
                status: Joi.string(),
                intervalType: Joi.string(),
                date: Joi.string()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const {
                groupId,
                offset,
                limit,
                status,
                interval,
                intervalType,
                date
            } = this.data;
            await orderService.manualPaymentCheck(
                parseInt(groupId),
                parseInt(offset),
                parseInt(limit),
                parseInt(interval),
                intervalType,
                status,
                date
            );
            return new ResponseBuilder(200, { success: true }, SUCCESS_200);
        } catch (e) {
            console.error('::Order Status:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
