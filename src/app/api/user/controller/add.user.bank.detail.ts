const { MasterController, RequestBuilder, Joi } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserBankDetail from '../services/user.bank.details';

export default class AddUserBankDetail extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Add User bank details',
            summary: 'Add User bank details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                beneficiaryName: Joi.string().required(),
                ifscCode: Joi.string().required(),
                accountNumber: Joi.string()
                    .pattern(/^\d{9,18}$/)
                    .message('Account number is invalid')
                    .required(),
                emailId: Joi.string()
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
                relationshipWithUser: Joi.string().optional()
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
            const result = await UserBankDetail.addBankDetail(bankData);
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('Add User Bank details error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
