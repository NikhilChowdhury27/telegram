const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import orderService from '../services/orders.service';
import orderServicev2 from '../services/order.service.v2';
import { ERROR_500 } from '../../../../config/constants/errorMessages';

export default class createOrder extends MasterController {
    static doc() {
        return {
            tags: ['payment'],
            description: 'create order',
            summary: 'create order'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
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
                period: Joi.alternatives().conditional('orderType', {
                    is: 'group',
                    then: Joi.string()
                        .valid(
                            'Weekly',
                            '2 Weeks',
                            'Monthly',
                            '2 Months',
                            '3 Months',
                            '6 Months',
                            '1 Year',
                            'Lifetime',
                            'Custom Period'
                        )
                        .optional()
                }),
                periodTitle: Joi.when('period', {
                    is: 'Custom Period',
                    then: Joi.string().required()
                }),
                couponName: Joi.string().optional(),
                v2Enabled: Joi.boolean().default(false).optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            let payload = {
                ...this.data,
                userId: this.req.user.id,
                email: this.req.user.email
            };
            if (!this.data.v2Enabled) {
                return await orderService.createOrder(payload);
            }

            return await orderServicev2.createOrderV2(payload);
        } catch (e) {
            console.error('::Create order:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
