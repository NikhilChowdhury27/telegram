import Common from '../../../../config/constants/common';
import { IPremiumTutorCreate } from '../tutor.interface';
import PremiumTutorService from '../services/premium.tutor.create';
const { MasterController, RequestBuilder, Joi } = require('base-packages');

export default class PremiumTutorCreate extends MasterController {
    static doc() {
        return {
            tags: ['tutors'],
            description: 'create tuto',
            summary: 'create tuto'
        };
    }

    static secured() {
        return false;
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                name: Joi.string().required(),
                mobile: Joi.string().required(),
                email: Joi.string().required(),
                orgId: Joi.number().required(),
                premiumExpiry: Joi.date().required(),
                countryCode: Joi.string()
            })
        );
        return payload;
    }

    async controller() {
        try {
            let data = <IPremiumTutorCreate>this.data;
            data.email = this.data.email || null;
            data.mobile = this.data.countryCode
                ? `${this.data.countryCode}${this.data.mobile}`
                : `91${this.data.mobile}`;
            data.premiumExpiryDate = this.data.premiumExpiry || null;
            data.orgId = this.data.orgId || null;
            data.name = this.data.name || null;
            data.premiumStatus =
                Number(new Date(data.premiumExpiryDate)) < Number(new Date())
                    ? 0
                    : 1;
            data.region = this.req.headers['region'] || 'IN';
            return await PremiumTutorService.create(data);
        } catch (error) {
            if (error.sequelErrorCode) {
                return new this.ResponseBuilder(
                    400,
                    {},
                    error.message || Common.SEQUELIZE_DATABASE_ERROR
                );
            }
            if (error.response) {
                return error.response(400);
            }
            return new this.ResponseBuilder(500, {}, Common.ERROR_500);
        }
    }
}
