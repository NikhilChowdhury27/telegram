const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import couponService from '../services/coupon.service';

export default class ChangeCouponStatus extends MasterController {
    static doc() {
        return {
            tags: ['coupons'],
            description: 'change coupon status for a group',
            summary: 'change coupon status for a group'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                couponId: Joi.number().min(1).required(),
                deleted: Joi.boolean().optional(),
                isActive: Joi.boolean().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await couponService.changeCouponStatus(this.data);
        } catch (e) {
            console.error('::change coupon status:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
