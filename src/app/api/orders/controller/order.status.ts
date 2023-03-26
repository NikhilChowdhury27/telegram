const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import orderService from '../services/orders.service';
import { ERROR_500 } from '../../../../config/constants/errorMessages';

export default class checkOrderStatus extends MasterController {
    static doc() {
        return {
            tags: ['check order/payment status'],
            description: 'check order/payment status',
            summary: 'check order/payment status'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                orderType: Joi.string().valid('group', 'message').required(),
                groupId: Joi.alternatives().conditional('orderType', {
                    is: 'group',
                    then: Joi.number().min(1).required()
                }),
                messageId: Joi.alternatives().conditional('orderType', {
                    is: 'message',
                    then: Joi.number().min(1).required()
                }),
                freemium: Joi.number().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const { id: userId } = this.data.user;
            const { groupId, messageId, freemium } = this.data;
            let response = await orderService.checkOrderStatus(
                groupId,
                messageId,
                userId,
                freemium
            );
            return response;
        } catch (e) {
            console.error('::Order Status:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
