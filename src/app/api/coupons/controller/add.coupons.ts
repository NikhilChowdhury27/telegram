const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import couponService from '../services/coupon.service';

export default class AddCoupons extends MasterController {
    static doc() {
        return {
            tags: ['coupons'],
            description: 'create coupon for a group',
            summary: 'create coupon for a group'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                name: Joi.string().max(25).required(),
                groupId: Joi.number().min(1).required(),
                type: Joi.string().valid('discount', 'percentage').required(),
                value: Joi.number().min(1).required(),
                isVisible: Joi.boolean().required(),
                plans: Joi.array().required(),
                userType: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await couponService.add(this.data);
        } catch (e) {
            console.error('::Create coupon:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
