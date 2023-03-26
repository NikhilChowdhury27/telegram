const { MasterController, RequestBuilder } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserDetails from '../services/user.details';

export default class GetStates extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Get state list',
            summary: 'Get state list'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            let result = await UserDetails.getStatesList();

            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('get states error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
