const { MasterController, RequestBuilder } = require('base-packages');
// import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import UserBankDetail from '../services/user.bank.details';

export default class MigrateAllBankDetails extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Migrate all User bank details ',
            summary: 'Migrate all bank details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            const result = await UserBankDetail.migrateBank();
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('Migrate All users Bank details error ::: ', error);
            return new this.ResponseBuilder(500, {}, error);
        }
    }
}
