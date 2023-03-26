const { MasterController, RequestBuilder, Joi } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import CheckTelegrsmService from '../services/check.telegram.username';

export default class CheckTelegramUserName extends MasterController {
    static doc() {
        return {
            tags: ['Auth'],
            description: 'Check Telegram User Name',
            summary: 'Check Telegram User Name'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                mobile: Joi.string().min(12).required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const { mobile } = this.data;
            const result = await CheckTelegrsmService.service(mobile);
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
