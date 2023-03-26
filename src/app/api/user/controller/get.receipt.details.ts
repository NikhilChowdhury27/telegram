const { MasterController, RequestBuilder } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import CreatorReceiptDetail from '../services/creator.receipt';

export default class GetUserReceiptDetails extends MasterController {
    static doc() {
        return {
            tags: ['User'],
            description: 'Get user receipt details',
            summary: 'Get receipt user details'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        return payload;
    }

    async controller() {
        try {
            let result = await CreatorReceiptDetail.fetchReceiptDetail(
                this.req.user.id
            );
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
