import { SUCCESS_200 } from '../../../../config/constants/errorMessages';
import Common from '../../../../config/constants/common';
import LeadsService from '../services/leads.service';
const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');

export default class LeadsController extends MasterController {
    static doc() {
        return {
            tags: ['tutors'],
            description: 'capture leads',
            summary: 'capture leads'
        };
    }

    static secured() {
        return false;
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                name: Joi.string().required(),
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

                email: Joi.string()
                    .custom((value, helper) => {
                        if (
                            !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                                value
                            )
                        ) {
                            return helper.message('Invalid Email');
                        }

                        return true;
                    })
                    .required(),
                contentCategory: Joi.string().optional(),
                sourcePlatform: Joi.string().optional(),
                communitySize: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const [newData, created] = await LeadsService.captureLeads(
                this.data
            );
            return new ResponseBuilder(
                200,
                {
                    new: created,
                    data: newData
                },
                SUCCESS_200
            );
        } catch (error) {
            return new ResponseBuilder(500, {}, Common.ERROR_500);
        }
    }
}
