const { MasterController, RequestBuilder, Joi } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import SearchUserService from '../services/search.user';

export default class SearchUser extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'search user',
            summary: 'search user'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToQuery(
            Joi.object().keys({
                mobile: Joi.string().required(),
                groupId: Joi.string().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            let result = await SearchUserService.searchUser(this.data);
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('search user error', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
