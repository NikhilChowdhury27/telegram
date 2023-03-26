const { MasterController, RequestBuilder, Joi, ResponseBuilder } = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import statsServices from '../services/stats.services';

export default class AllStats extends MasterController {
	static doc() {
		return {
			tags: ['stats'],
			description: 'All stats',
			summary: 'All stats'
		};
	}

	static validate() {
		const payload = new RequestBuilder();
		payload.addToQuery(
			Joi.object().keys({
				limit: Joi.number().min(1).optional(),
				offset: Joi.number().min(0).optional(),
			})
		);
		return payload;
	}

	async controller() {

		try {
			return statsServices.myEarnings(this.data, this.data.user.id);
		} catch (e) {
			console.error('::stats group:: ', e);
			return new ResponseBuilder(500, {}, ERROR_500);
		}
	}
}
