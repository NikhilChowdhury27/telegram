const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import {
    ERROR_500,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';

export default class MigrateGroupPlans extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Migrate Group plans',
            summary: 'Migrate Group plans'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.string().optional(),
                offset: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const result = await GroupServiceV2.migrateGroupPlans(this.data);
            return new ResponseBuilder(200, result, SUCCESS_200);
        } catch (error) {
            return new ResponseBuilder(500, { error: error }, ERROR_500);
        }
    }
}
