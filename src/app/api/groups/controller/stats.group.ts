const { MasterController, RequestBuilder, Joi, ResponseBuilder } = require('base-packages');
import { ERROR_500 } from '../../../../config/constants/errorMessages';
import groupService from '../services/group';

export default class StatsGroup extends MasterController {
	static doc() {
		return {
			tags: ['group'],
			description: 'Stats of groups',
			summary: 'Stats of groups'
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
			return await groupService.stats(this.data, this.data.user.id);
		} catch (e) {
			console.error('::stats group:: ', e);
			return new ResponseBuilder(500, {}, ERROR_500);
		}
	}
}
