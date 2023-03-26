const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import couponService from '../services/coupon.service';

export default class GetCoupons extends MasterController {
    static doc() {
        return {
            tags: ['coupons'],
            description: 'get coupon for a group',
            summary: 'get coupon for a group'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                groupId: Joi.number().min(1).required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await couponService.get(this.data, this.data.user.id);
        } catch (e) {
            console.error('::get Coupon:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
