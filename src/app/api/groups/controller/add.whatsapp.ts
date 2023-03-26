const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';

export default class AddWhatsappGroup extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'create your group',
            summary: 'create your group'
        };
    }

    static validate() {
        const payment = Joi.object().keys({
            price: Joi.when('selectedOffer', {
                is: 'Free Trial',
                then: Joi.number().min(0).required(),
                otherwise: Joi.number().min(1).required()
            }),
            selectedPeriod: Joi.string()
                .valid(
                    'Weekly',
                    '2 Weeks',
                    'Monthly',
                    '2 Months',
                    '3 Months',
                    '6 Months',
                    '1 Year',
                    'Lifetime',
                    'Custom Period'
                )
                .required(),
            customType: Joi.string().when('selectedPeriod', {
                is: 'Custom Period',
                then: Joi.string().valid('Months', 'Days').required()
            }),
            customValue: Joi.when('selectedPeriod', {
                is: 'Custom Period',
                then: Joi.when('customType', {
                    is: 'Days',
                    then: Joi.when('selectedOffer', {
                        is: 'Free Trial',
                        then: Joi.number().integer().min(2).required(),
                        otherwise: Joi.number().integer().min(7).required()
                    }),
                    otherwise: Joi.number().integer().min(1).required()
                })
            }),
            discount: Joi.number().default(0),
            selectedOffer: Joi.string().default('')
        });
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                name: Joi.string().min(3),
                about: Joi.string().optional().allow(''),
                logoUrl: Joi.string().optional(),
                category: Joi.string().max(100).optional(),
                pricing: Joi.array().items(payment),
                v2Enabled: Joi.boolean().default(false).optional(),
                conditionalApproval: Joi.boolean().optional(),
                formLink: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await GroupServiceV2.whatsappAdd(
                this.data,
                this.data.user.id
            );
        } catch (e) {
            console.error('::Create group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
