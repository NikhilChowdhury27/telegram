const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';

export default class groupMembersMigration extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Migrate Group Members',
            summary: 'Migrate Group Members'
        };
    }

    static validate() {
        const membersData = Joi.object().keys({
            email: Joi.string().optional(),
            mobile: Joi.string()
                .custom((value, helper) => {
                    if (value.length < 12) {
                        return helper.message(
                            `10 digit mobile is required-${value}`
                        );
                    }
                    if (!/^(\91)[6789]\d{9}$/.test(value)) {
                        return helper.message(`Invalid mobile number-${value}`);
                    }
                    return true;
                })
                .required(),
            joiningDate: Joi.string().required(),
            expiryDate: Joi.string().optional().default(''),
            name: Joi.string().min(3).required(),
            amount: Joi.string().required(),
            internetHandlingCharges: Joi.string().default(0),
            classplusShare: Joi.string().default(0)
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
            return await groupService.createMigrationMemberMapping(this.data);
        } catch (e) {
            console.error('::Group Members Migration:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
