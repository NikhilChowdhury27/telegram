const {
    MasterController,
    RequestBuilder,
    ResponseBuilder,
    Joi
} = require('base-packages');
// import Common from '../../../../config/constants/common';
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import CreatorReceiptDetail from '../services/creator.receipt';

export default class AddCreatorReceiptDetail extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Add User receipt details',
            summary: 'Add User receipt details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        const receipt = Joi.object().keys({
            orgName: Joi.string().required(),
            address: Joi.string().required(),
            state: Joi.string().required(),
            pinCode: Joi.string()
                .pattern(/^[1-9][0-9]{5}$/)
                .message('Pincode is invalid')
                .required(),
            gstNumber: Joi.string().optional()
        });
        payload.addToBody(
            Joi.object().keys({
                receipt: Joi.array().items(receipt).required()
            })
        );

        return payload;
    }

    async controller() {
        try {
            const result = await CreatorReceiptDetail.addReceiptDetailScript(
                this.data.receipt
            );
            return new ResponseBuilder(
                result.statusCode,
                { data: result.data },
                result.message
            );
        } catch (error) {
            console.log('Add User Reecipt details error ::: ', error);
            return new ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
