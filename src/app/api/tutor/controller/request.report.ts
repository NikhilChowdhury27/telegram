const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import statsService from '../../stats/services/stats.services';

export default class RequestReport extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'create report',
            summary: 'create report'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                type: Joi.string(),
                channel: Joi.number().optional(),
                period: Joi.number().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return statsService.createReport(this.data);
        } catch (e) {
            console.error('::Create group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
