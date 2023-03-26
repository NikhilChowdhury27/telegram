const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import {
    ERROR_400,
    ERROR_500
} from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';

export default class GroupRazorpayLinksGeneration extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Generate Razorpay Links',
            summary: 'Generate Razorpay Links'
        };
    }

    static validate() {
        const membersData = Joi.object().keys({
            email: Joi.string().optional().allow(''),
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
            expiryDate: Joi.string().optional().allow(''),
            name: Joi.string().min(3).required(),
            amount: Joi.string().required()
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
            if (this.req.headers['x-access-token'] !== process.env.API_SECRET) {
                return new ResponseBuilder(
                    400,
                    {
                        message: 'Invalid Signature'
                    },
                    ERROR_400
                );
            }
            console.log(this.data);
            return await GroupServiceV2.generateBulkPaymentLinks(this.data);
        } catch (e) {
            console.error('::Group Members Migration:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
