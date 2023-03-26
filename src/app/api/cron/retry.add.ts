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

export default class RetryAddToGroupCron extends MasterController {
    static doc() {
        return {
            tags: ['Cron'],
            description: 'Retry adding failed users to group',
            summary: 'Retry adding failed users to group'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            await MemberService.retryAdd();
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::RetryAddToGroupCron Controller:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
