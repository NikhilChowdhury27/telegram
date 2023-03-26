const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import messageService from '../services/message.service';
import messageUtil from '../../../utils/message/message';
export default class getMessages extends MasterController {
    static doc() {
        return {
            tags: ['get Message'],
            description: 'get messages created/bought',
            summary: 'get messages created/bought'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                messageId: Joi.string().optional(), // if messageId is not provided, simply return the messages created by user/bought by user if not expired,
                limit: Joi.string().optional(),
                offset: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        const { id: userId } = this.data.user;
        let res: any = await messageService.get(this.data, userId);
        if (res && res.length) {
            res = messageUtil.formatAttachments(res);
        }
        return new ResponseBuilder(200, res, 'ok');
    }
}
