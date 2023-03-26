const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import {
    // ERROR_500,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';

export default class CreateGroupCoAdmin extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Create Group Co-admin',
            summary: 'Create Group Co-admin'
        };
    }

    static validate() {
        const payload = new RequestBuilder();

        payload.addToBody(
            Joi.object().keys({
                groupId: Joi.number().min(1).required(),
                name: Joi.string().optional(),
                mobile: Joi.string()
                    .custom((value, helper) => {
                        if (value.length < 12) {
                            return helper.message(
                                '10 digit mobile is required'
                            );
                        }
                        if (!/^(\91)[6789]\d{9}$/.test(value)) {
                            return helper.message('Invalid mobile number');
                        }
                        return true;
                    })
                    .required(),
                sessionId: Joi.string().required(),
                otp: Joi.string().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const result = await GroupServiceV2.CheckAndCreateCoAdmin(
                this.data
            );
            return new ResponseBuilder(200, result, SUCCESS_200);
        } catch (e) {
            console.error(':: Create Group Co-admin ', e);
            return new ResponseBuilder(500, {}, e.message);
        }
    }
}
