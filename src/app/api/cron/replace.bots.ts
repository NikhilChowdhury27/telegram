const {
    MasterController,
    RequestBuilder,
    ResponseBuilder
} = require('base-packages');
import {
    ERROR_500,
    SUCCESS_200
} from '../../../config/constants/errorMessages';
import groupService from '../../api/groups/services/group';

export default class AddBotGroupCron extends MasterController {
    static doc() {
        return {
            tags: ['Cron'],
            description: 'Add Bot To  Channel Cron',
            summary: 'Add Bot To Backup Channel Cron'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            await groupService.replaceBots();
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::AddRemovalBotGroupCron Controller:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
