import BankDetail from '../../models/BankDetail';
import CommonRepository from '../utils/common.repository';

class BankDetailRepository extends CommonRepository {
    async addBankDetail(data) {
        try {
            return await BankDetail.create(<any>data);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getBankDetail(filter) {
        try {
            return await BankDetail.findOne({ where: filter });
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new BankDetailRepository();
