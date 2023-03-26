const {
    MasterController,
    RequestBuilder,
    ResponseBuilder
} = require('base-packages');
import {
    ERROR_500,
    SUCCESS_200
} from '../../../config/constants/errorMessages';
import MemberService from '../members/services/member.service';

export default class ExpiryReminderCron extends MasterController {
    static doc() {
        return {
            tags: ['Cron'],
            description: 'Expiry Reminder Cron',
            summary: 'Expiry Reminder Cron'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            await MemberService.expiryReminder();
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::Expiry Reminder Cron Controller Error:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
