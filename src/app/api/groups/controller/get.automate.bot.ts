const {
    MasterController,
    RequestBuilder,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';

export default class GetBot extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Get bot details',
            summary: 'Get bot details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            return await groupService.getAutomateBot();
        } catch (e) {
            console.error('::get BOT:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
