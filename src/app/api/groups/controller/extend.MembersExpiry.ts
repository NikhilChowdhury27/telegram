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
import groupService from '../services/group';

export default class ExtendMembersExpiry extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Extend Members Expiry',
            summary: 'Extend Members Expiry'
        };
    }

    static validate() {
        const membersData = Joi.object().keys({
            mobile: Joi.string()
                .custom((value, helper) => {
                    if (value.length < 12) {
                        return helper.message('10 digit mobile is required');
                    }
                    if (!/^(\91)[6789]\d{9}$/.test(value)) {
                        return helper.message('Invalid mobile number');
                    }
                    return true;
                })
                .required(),

            expiryDate: Joi.string().optional().default('')
        });
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                membersData: Joi.array().items(membersData).required(),
                groupId: Joi.number().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const result = await groupService.extendMembersExpiry(this.data);
            return new ResponseBuilder(200, result, SUCCESS_200);
        } catch (e) {
            console.error('::Group Members Expiry Extension:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
