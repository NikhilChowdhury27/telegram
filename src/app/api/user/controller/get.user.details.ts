const { MasterController, RequestBuilder } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserDetails from '../services/user.details';

export default class GetUserDetails extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Get user details',
            summary: 'Get user details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            let result = await UserDetails.getUserDetails(this.req.user);
            const appId = Number(process.env.apiId);
            const appHash = process.env.apiHash;
            result.data['appId'] = appId;
            result.data['appHash'] = appHash;
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('get User Details error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
