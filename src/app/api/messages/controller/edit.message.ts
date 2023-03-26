const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
// import Telegram from '../../../utils/telegram/telegram.common';
import messageService from '../services/message.service';

export default class addMessage extends MasterController {
    static doc() {
        return {
            tags: ['edit Message'],
            description: 'edit message details',
            summary: 'edit price or status'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                price: Joi.number().min(1).optional(),
                isActive: Joi.boolean().optional()
            })
        );
        return payload;
    }

    async controller() {
        const { id: userId } = this.data.user;
        const updateFields = {};
        if (this.data.price) {
            updateFields['messagePrice'] = this.data.price;
        }
        if (this.data.status) {
            updateFields['isActive'] = +this.data.isActive;
        }
        const filter = {
            id: this.data.messageId,
            createdBy: userId
        };
        const res = await messageService.edit(updateFields, filter);
        // console.log('response from db: ', res);
        if (!res.length) {
            return new ResponseBuilder(401, {}, 'Unauthorized');
        }
        return new ResponseBuilder(200, {}, 'edited Successfully');
    }
}
