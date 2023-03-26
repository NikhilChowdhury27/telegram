const { MasterController, RequestBuilder, Joi } = require('base-packages');
import Common from '../../../../config/constants/common';
import updateUserSession from '../services/user.update.session';

export default class SaveUserDetails extends MasterController {
    static doc() {
        return {
            tags: ['SaveUserDetails'],
            description: 'SaveUserDetails',
            summary: 'SaveUserDetails'
        };
    }

    static secured() {
        return false;
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                session: Joi.string().required(),
                telegramUserId: Joi.string().required(),
                telegramAccessHash: Joi.string().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            await updateUserSession.service(this.data);
            return new this.ResponseBuilder(200, {}, Common.SUCCESS);
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
