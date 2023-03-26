const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import groupService from '../../groups/services/group';
import { ERROR_500 } from '../../../../config/constants/errorMessages';

export default class dummyOrder extends MasterController {
    static doc() {
        return {
            tags: ['payment'],
            description: 'create order',
            summary: 'create order'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                groupId: Joi.number().min(1).required(),
                userId: Joi.number().required(),
                plan: Joi.string().required(),
                amount: Joi.number().required(),
                paymentId: Joi.number().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            // let payload = {
            //     ...this.data,
            //     userId: this.req.user.id,
            //     email: this.req.user.email
            // };
            let payload = this.data;
            let response = await groupService.join(payload);
            return response;
        } catch (e) {
            console.error('::Create order:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
