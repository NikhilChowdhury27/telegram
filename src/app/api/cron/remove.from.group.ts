const {
	MasterController,
	RequestBuilder,
	ResponseBuilder
} = require('base-packages');
import { ERROR_500, SUCCESS_200 } from '../../../config/constants/errorMessages';
import GroupService from '../groups/services/group';


export default class RemoveFromGroupCron extends MasterController {
	static doc() {
		return {
			tags: ['Cron'],
			description: 'remove expired users from group',
			summary: 'remove expired users from group'
		};
	}

	static validate() {
		const payload = new RequestBuilder();
		return payload;
	}

	async controller() {
		try {
			await GroupService.removeFromGroup();
			return new ResponseBuilder(200, {}, SUCCESS_200);
		} catch (e) {
			console.error('::RemoveFromGroupCron Controller:: ', e);
			return new ResponseBuilder(500, {}, ERROR_500);
		}
	}
}
