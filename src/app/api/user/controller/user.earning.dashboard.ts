const { MasterController, RequestBuilder, Joi } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserEarnings from '../services/user.earnings';

export default class GetUserEarnings extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Get user earnings',
            summary: 'Get user earnings'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                limit: Joi.number().min(1).optional(),
                offset: Joi.number().min(0).optional(),
                startDate: Joi.string().optional(),
                endDate: Joi.string().optional(),
                version2: Joi.boolean().default(false).optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            let result;
            if (this.data.version2 === 'true') {
                result = await UserEarnings.getUserEarningsV2(
                    this.data,
                    this.req.user
                );
            } else {
                result = await UserEarnings.getUserEarnings(
                    this.data,
                    this.req.user
                );
            }

            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('earning dashboard error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
