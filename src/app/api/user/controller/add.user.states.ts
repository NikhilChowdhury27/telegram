const { MasterController, RequestBuilder, Joi } = require('base-packages');
// import Common from '../../../../config/constants/common';
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import CreatorReceiptDetail from '../services/creator.receipt';

export default class AddStatesScript extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Add User state details',
            summary: 'Add User state details'
        };
    }

    static validate() {
        const membersData = Joi.object().keys({
            state: Joi.string().required(),
            userId: Joi.number().required()
        });
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                membersData: Joi.array().items(membersData).required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const result = await CreatorReceiptDetail.addStateScript(
                this.data.membersData
            );
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('Add User state details error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
