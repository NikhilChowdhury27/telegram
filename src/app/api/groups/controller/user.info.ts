const { MasterController } = require('base-packages');
import groupService from '../services/group';

export default class getUserInfo extends MasterController {
	static doc() { }

	// static validate() {
	//     const payload = new RequestBuilder();
	//     payload.addToQuery(
	//         Joi.object().keys({
	//             status: Joi.string().valid('subscribed', 'created')
	//         })
	//     );
	//     return payload;
	// }

	async controller() {
		await groupService.userInfo(this.data);
		return {
			data: {
				name: 'abc',
				description: 'description',
				memberCount: 123
			},
			message: 'Sucess'
		};
	}
}
