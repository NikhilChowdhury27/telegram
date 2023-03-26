import ReceiptDetail from '../../models/ReceiptDetails';
import CommonRepository from '../utils/common.repository';

class ReceiptDetailRepository extends CommonRepository {
    async addDetail(data: any) {
        try {
            return await ReceiptDetail.findOrCreate({
                where: {
                    userId: data.userId
                },
                defaults: data
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async editDetail(data: any, userId: number) {
        try {
            return await ReceiptDetail.update(data, {
                where: {
                    userId: userId
                }
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDetail(filter: any, include?: any) {
        try {
            return await ReceiptDetail.findOne({
                where: filter,
                include: include || [],
                raw: false
            });
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new ReceiptDetailRepository();
