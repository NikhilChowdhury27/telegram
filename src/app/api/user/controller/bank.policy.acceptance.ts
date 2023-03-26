const { MasterController, RequestBuilder, Joi } = require('base-packages');
// import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserBankDetail from '../services/user.bank.details';

export default class AgreeToBankPolicy extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Agree to the bank details policy for transfer',
            summary: 'Agree to the bank details policy for transfer'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                accountId: Joi.number().required(),
                action: Joi.string()
                    .valid('T&CAccepted', 'AccountDeleted')
                    .required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            console.log('logging IP', this.req.headers['x-forwarded-for']);
            const ipAddress = this.req.headers['x-forwarded-for'].length
                ? this.req.headers['x-forwarded-for'].split(',')[0]
                : '';
            const bankData = {
                ...this.data,
                userId: this.req.user.id,
                ipAddress: ipAddress
            };
            const result = await UserBankDetail.acceptBankPolicy(bankData);
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('Accept bank Policy error ::: ', error);
            return new this.ResponseBuilder(500, {}, error);
        }
    }
}
