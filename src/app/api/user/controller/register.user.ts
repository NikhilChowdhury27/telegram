const { MasterController, RequestBuilder, Joi } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import AuthService from '../services/user.auth';

export default class RegisterUser extends MasterController {
    static doc() {
        return {
            tags: ['Auth'],
            description: 'Register User',
            summary: 'Register User'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                contact: Joi.object().keys({
                    email: Joi.string()
                        .custom((value, helper) => {
                            if (
                                !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                                    value
                                )
                            ) {
                                return helper.message('Invalid Email');
                            }

                            return true;
                        })
                        .required(),
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
                        .required()
                }),
                name: Joi.string().required(),
                sessionId: Joi.string().required(),
                otp: Joi.string().required(),
                whatsappStatus: Joi.boolean().optional(),
                state: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const result = await AuthService.register(this.data);
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('register user error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
