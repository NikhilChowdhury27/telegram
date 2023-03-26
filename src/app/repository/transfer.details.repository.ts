import TransferDetails from '../../models/transferDetails';
import CommonRepository from '../utils/common.repository';
import { ITransfer } from '../api/orders/orders.interface';

export class TransferRepository extends CommonRepository {
    async createTransfer(transfer: ITransfer) {
        let transferDetils = new TransferDetails();
        transferDetils.orderId = transfer.orderId;
        transferDetils.amount = transfer.amount;
        transferDetils.userId = transfer.userId;
        return await transferDetils.save();
    }

    async findTransfer(transfer: any) {
        return await TransferDetails.findOne({
            where: {
                orderId: transfer.orderId
            }
        });
    }

    async updateTransfer(update, orderId) {
        return await TransferDetails.update(update, {
            where: {
                orderId
            }
        });
    }

    async getTransferByOrderId(orderId: string) {
        return await TransferDetails.findOne({
            where: {
                orderId
            },
            raw: true
        });
    }
}

export default new TransferRepository();
