const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';

export default class GetChannel extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Get group details',
            summary: 'Get group details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();

        payload.addToQuery(
            Joi.object().keys({
                channelId: Joi.number()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await GroupServiceV2.getChannelDetails(this.data);
        } catch (e) {
            console.error('::get group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
