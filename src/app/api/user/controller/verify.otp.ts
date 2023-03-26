const { MasterController, RequestBuilder, Joi } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import AuthService from '../services/user.auth';

export default class VerifyOTP extends MasterController {
    static doc() {
        return {
            tags: ['Auth'],
            description: 'Verify OTP',
            summary: 'Verify OTP'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                otp: Joi.string().required(),
                sessionId: Joi.string(),
                mobile: Joi.string()
                    .custom((value, helper) => {
                        if (value.length < 12) {
                            return helper.message(
                                '10 digit mobile is required'
                            );
                        }
                        if (!/^(\91)[6789]\d{9}$/.test(value)) {
                            return helper.message('Invalid mobile number');
                        }
                        return true;
                    })
                    .required(),
                whatsappStatus: Joi.boolean().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const result = await AuthService.verifyOtp(this.data);
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('verify otp error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
