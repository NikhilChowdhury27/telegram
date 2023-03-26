const {
    MasterController,
    RequestBuilder,
    ResponseBuilder,
    Joi
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
            description: 'Backup links Cron',
            summary: 'Backup links Cron'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.number().required()
            })
        );
        payload.addToBody(
            Joi.object().keys({
                groupIds: Joi.array().items(Joi.number()).optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const { groupIds, limit } = this.data;
            await groupService.createGroupInviteLinks(groupIds, limit);
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::BackupLinksCron Controller:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
