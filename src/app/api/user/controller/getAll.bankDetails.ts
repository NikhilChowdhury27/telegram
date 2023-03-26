const { MasterController, RequestBuilder } = require('base-packages');
// import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserBankDetail from '../services/user.bank.details';

export default class GetAllBankDetails extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Gets all User bank details ',
            summary: 'Gets all bank details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            const result = await UserBankDetail.getAllBankDetails(
                this.req.user.id
            );
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('Get All Active Bank details error ::: ', error);
            return new this.ResponseBuilder(500, {}, error);
        }
    }
}
