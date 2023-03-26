const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import messageService from '../services/message.service';
import messageUtil from '../../../utils/message/message';

export default class addGroup extends MasterController {
    static doc() {
        return {
            tags: ['get Message'],
            description: 'get message details unauth',
            summary: 'get message details unauth'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                messageId: Joi.string().optional() // if messageId is not provided, simply return the messages created by user/bought by user if not expired,
            })
        );
        return payload;
    }

    async controller() {
        let res = await messageService.get(this.data);
        if (res) {
            // res = res['dataValues'];
            delete res['lockedMessage'];
            delete res['channelHash'];
            delete res['channelId'];
            delete res['revenue'];
            res = messageUtil.formatAttachments(res);
        }
        return new ResponseBuilder(200, res || {}, 'ok');
    }
}
