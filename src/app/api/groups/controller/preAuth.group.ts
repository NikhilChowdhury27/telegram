const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';
import GroupServiceV2 from '../services/group_V2';

export default class PreAuthGroup extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Pre Group Details',
            summary: 'Pre Group Details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToPath(
            Joi.object().keys({
                id: Joi.string().required()
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
                return await GroupServiceV2.getPreAuthGroupData(this.data);
            }
            return await groupService.getPreAuthGroupData(this.data);
        } catch (e) {
            console.error('::preAuthGroup group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
