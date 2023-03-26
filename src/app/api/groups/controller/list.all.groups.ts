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
            description: 'list your active groups',
            summary: 'list your groups'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(Joi.object().keys());
        return payload;
    }

    async controller() {
        try {
            return await groupService.listAll(this.data.user.id);
        } catch (e) {
            console.error('::list group all:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
