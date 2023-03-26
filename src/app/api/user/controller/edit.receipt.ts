const { MasterController, RequestBuilder, Joi } = require('base-packages');
// import Common from '../../../../config/constants/common';
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import CreatorReceiptDetail from '../services/creator.receipt';

export default class EditCreatorReceiptDetail extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Edit User receipt details',
            summary: 'Edit User receipt details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                orgName: Joi.string().required(),
                address: Joi.string().required(),
                state: Joi.string().required(),
                pinCode: Joi.string()
                    .pattern(/^[1-9][0-9]{5}$/)
                    .message('Pincode is invalid')
                    .required(),
                gstNumber: Joi.string().optional(),
                gstCertificate: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const result = await CreatorReceiptDetail.editReceiptDetail(
                this.data,
                this.req.user.id
            );
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('Add User Reecipt details error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
