const { MasterController, RequestBuilder, Joi } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import AuthService from '../services/user.auth';

export default class GetOtp extends MasterController {
    static doc() {
        return {
            tags: ['Auth'],
            description: 'Get OTP',
            summary: 'Get OTP'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                mobile: Joi.string()
                    .custom((value, helper) => {
                        console.log({
                            value,
                            helper
                        });
                        if (value.length < 12) {
                            return helper.message(
                                '10 digit mobile is required'
                            );
                        }
                        if (!/^(\91)[6789]\d{9}$/.test(value)) {
                            return helper.message('Invalid mobile number');
                        }

                        // console.log('here');

                        return true;
                    })
                    .required(),
                whatsappStatus: Joi.boolean().optional()
            })
        );
        payload.addToQuery(
            Joi.object().keys({
                type: Joi.string().optional(),
                groupId: Joi.number().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const { mobile, whatsappStatus, type, groupId } = this.data;
            const result = await AuthService.getOtp(
                mobile,
                whatsappStatus,
                type,
                groupId
            );
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
