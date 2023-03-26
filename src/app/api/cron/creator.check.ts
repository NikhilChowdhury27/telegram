const {
    MasterController,
    RequestBuilder,
    ResponseBuilder
} = require('base-packages');
import {
    ERROR_500,
    SUCCESS_200
} from '../../../config/constants/errorMessages';
import GroupService from '../groups/services/group';

export default class RemoveFromGroupCron extends MasterController {
    static doc() {
        return {
            tags: ['Cron'],
            description: 'check creator cron',
            summary: 'check creator cron'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            await GroupService.checkAdminStatus();
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::CheckCreatorCron Controller:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
