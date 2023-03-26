const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';
import GroupServiceV2 from '../services/group_V2';

export default class UpdateGroup extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Update group',
            summary: 'Update group'
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
        payload.addToPath(
            Joi.object().keys({
                groupId: Joi.number().min(1).required()
            })
        );
        payload.addToBody(
            Joi.object().keys({
                pricing: Joi.array().items(payment),
                name: Joi.string().min(3).optional(),
                v2Enabled: Joi.boolean().default(false).optional(),
                logoUrl: Joi.string().optional(),
                description: Joi.string().optional().allow(''),
                conditionalApproval: Joi.boolean().optional(),
                formLink: Joi.string().optional().allow('')
            })
        );
        return payload;
    }

    async controller() {
        try {
            if (this.data.v2Enabled) {
                return await GroupServiceV2.updateGroup(
                    this.data.groupId,
                    this.data.user.id,
                    this.data.pricing,
                    this.data.name,
                    this.data.logoUrl,
                    this.data.description,
                    this.data.conditionalApproval,
                    this.data.formLink
                );
            }

            return await groupService.updateGroup(
                this.data.groupId,
                this.data.user.id,
                this.data.pricing,
                this.data.name,
                this.data.description
            );
        } catch (e) {
            console.error('::Update group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
