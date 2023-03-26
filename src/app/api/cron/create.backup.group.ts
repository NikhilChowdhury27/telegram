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

export default class CreateBackupGroupCron extends MasterController {
    static doc() {
        return {
            tags: ['Cron'],
            description: 'Create Backup Group Cron',
            summary: 'Create Backup Group Cron'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            await groupService.createBackupGroup();
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::CraeteBackupCron Controller:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
