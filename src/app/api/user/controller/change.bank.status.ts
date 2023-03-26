const { MasterController, RequestBuilder, Joi } = require('base-packages');
// import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserBankDetail from '../services/user.bank.details';

export default class ChangeBankDetailStatus extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Change User bank details status',
            summary: 'Change User bank details status'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                isPrimary: Joi.number().optional(),
                isDeleted: Joi.number().optional(),
                bankDetailId: Joi.number().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const bankData = {
                ...this.data,
                email: this.req.user.email,
                userId: this.req.user.id
            };
            const result = await UserBankDetail.changeBankDetails(bankData);
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('Change User Bank details error ::: ', error);
            return new this.ResponseBuilder(500, {}, error);
        }
    }
}
