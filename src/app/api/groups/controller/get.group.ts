const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';
import GroupServiceV2 from '../services/group_V2';

export default class GetGroup extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Get group details',
            summary: 'Get group details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToPath(
            Joi.object().keys({
                groupId: Joi.number().min(1).required()
            })
        );
        payload.addToQuery(
            Joi.object().keys({
                v2Enabled: Joi.boolean().default(false).optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            if (this.data.v2Enabled === 'true') {
                return await GroupServiceV2.getGroupDetails(this.data);
            }
            return await groupService.getGroupDetails(this.data);
        } catch (e) {
            console.error('::get group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
