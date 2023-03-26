const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import memberService from '../services/member_V2.service';

export default class MembersRenewal extends MasterController {
    static doc() {
        return {
            tags: ['member'],
            description: 'Renew Script',
            summary: 'Renew Script'
        };
    }

    static validate() {
        const membersData = Joi.object().keys({
            mobile: Joi.string()
                .custom((value, helper) => {
                    if (value.length < 12) {
                        return helper.message(
                            `10 digit mobile is required, given - ${value}`
                        );
                    }
                    if (!/^(\91)[6789]\d{9}$/.test(value)) {
                        return helper.message(
                            `Invalid mobile number - ${value}  `
                        );
                    }
                    return true;
                })
                .required(),
            groupId: Joi.number().required()
        });
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                membersData: Joi.array().items(membersData).required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await memberService.renewalTriggerScript(
                this.data.membersData
            );
        } catch (e) {
            console.error('::Renewal Script:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
