const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import memberService from '../services/message.member';

export default class listMember extends MasterController {
    static doc() {
        return {
            tags: ['member'],
            description: 'list members',
            summary: 'list members'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToPath(
            Joi.object().keys({
                messageId: Joi.number().min(1).required()
            })
        );
        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.number().min(1).optional(),
                offset: Joi.number().min(0).optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await memberService.listMembers(this.data.messageId);
        } catch (e) {
            console.error('::list member:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
