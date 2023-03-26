const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';

export default class GetGroupCoAdmin extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Get group coadmin List',
            summary: 'Get group coadmin List'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToPath(
            Joi.object().keys({
                groupId: Joi.number().min(1).required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await GroupServiceV2.GetGeoupCoAdminList(this.data.groupId);
        } catch (e) {
            console.error('::Get CoAdmins List:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
