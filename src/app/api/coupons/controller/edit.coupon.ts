const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import couponService from '../services/coupon.service';

export default class EditCouponDetails extends MasterController {
    static doc() {
        return {
            tags: ['coupons'],
            description: 'check coupon validity for a group',
            summary: 'check coupon validity for a group'
        };
    }

    static validate() {
        const planChanges = Joi.object().keys({
            plan: Joi.number().required(),
            isActive: Joi.boolean().required()
        });
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                couponId: Joi.number().required(),
                plans: Joi.array().items(planChanges).required(),
                groupId: Joi.number().min(1).required(),
                type: Joi.string().required(),
                value: Joi.number().required(),
                isVisible: Joi.boolean().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await couponService.editCoupon(this.data);
        } catch (e) {
            console.error('::change coupon status:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
