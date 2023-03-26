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
import MemberServiceV2 from '../services/member_V2.service';

export default class MigrateMemberPlans extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Migrate Member plans',
            summary: 'Migrate Member plans'
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
            const result = await MemberServiceV2.addMemberPlans(this.data);
            return new ResponseBuilder(200, result, SUCCESS_200);
        } catch (error) {
            return new ResponseBuilder(500, { error: error }, ERROR_500);
        }
    }
}
