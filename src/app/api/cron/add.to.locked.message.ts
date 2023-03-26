const {
    MasterController,
    RequestBuilder,
    ResponseBuilder
} = require('base-packages');
import {
    ERROR_500,
    SUCCESS_200
} from '../../../config/constants/errorMessages';
import messageService from '../../api/messages/services/message.service';

export default class AddToMessageCron extends MasterController {
    static doc() {
        return {
            tags: ['Cron'],
            description: 'Locked Nessage add Cron',
            summary: 'Locked Nessage add Cron'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            await messageService.retryAddLockedMessage();
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::RetryAddToMessageCron Controller:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
