const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';

export default class listGroup extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'list your groups, created or subscribed to',
            summary: 'list your groups, created or subscribed to'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                status: Joi.string().valid('subscribed', 'created'),
                limit: Joi.string().optional(),
                offset: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await groupService.list(this.data, this.data.user.id);
        } catch (e) {
            console.error('::list group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
