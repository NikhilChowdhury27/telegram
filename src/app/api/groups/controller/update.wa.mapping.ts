const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';

export default class MapWaGroup extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'create mapping  group',
            summary: 'create mapping  group'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                groupId: Joi.number().required(),
                primaryPhone: Joi.number().required(),
                secondaryPhone: Joi.number().required(),
                channelId: Joi.string().required(),
                joinedBy: Joi.string().required()
            })
        );

        return payload;
    }

    async controller() {
        try {
            return await GroupServiceV2.whatsappMap(
                this.data,
                this.data.user.id
            );
        } catch (e) {
            console.error('::Create group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
