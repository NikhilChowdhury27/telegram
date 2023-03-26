const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import couponService from '../services/coupon.service';

export default class CheckCouponValidity extends MasterController {
    static doc() {
        return {
            tags: ['coupons'],
            description: 'check coupon validity for a group',
            summary: 'check coupon validity for a group'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                couponName: Joi.string().required(),
                groupId: Joi.number().min(1).required(),
                plan: Joi.object().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await couponService.checkCouponValidity(this.data);
        } catch (e) {
            console.error('::change coupon status:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
