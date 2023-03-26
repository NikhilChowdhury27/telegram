import CommonRepository from '../utils/common.repository';
import PaymentTable from '../../models/PaymentTable';
import { IPayment } from '../api/orders/orders.interface';
import { Op } from 'sequelize';

export class PaymentRepository extends CommonRepository {
    async createPayment(payment: IPayment) {
        let paymentTable = new PaymentTable();
        paymentTable.buyerId = payment.buyerId;
        paymentTable.amount = payment.amount;
        paymentTable.orderType = payment.orderType;
        paymentTable.groupId = payment.groupId;
        paymentTable.messageId = payment.messageId;
        paymentTable.sellerId = payment.sellerId;
        paymentTable.currentPlan = payment.currentPlan;
        paymentTable.orderId = payment.orderId;

        if (payment.status) {
            paymentTable.status = payment.status;
            paymentTable.paymentStatus = payment.paymentStatus;
        }
        if (payment.couponName) {
            paymentTable.couponName = payment.couponName;
            paymentTable.couponDiscount = payment.couponDiscount;
            paymentTable.planDiscount = payment.planDiscount;
        }
        if (payment.planId) {
            paymentTable.planId = payment.planId;
        }
        return await paymentTable.save();
    }

    async findOrCreatePayment(payload: any) {
        const [payment, created] = await PaymentTable.findOrCreate({
            where: {
                buyerId: payload.buyerId,
                sellerId: payload.sellerId,
                groupId: payload.groupId,
                migrated: payload.migrated
            },
            defaults: {
                buyerId: payload.buyerId,
                sellerId: payload.sellerId,
                amount: payload.amount,
                orderType: payload.orderType,
                currentPlan: payload.currentPlan,
                groupId: payload.groupId,
                migrated: payload.migrated,
                orderId: payload.orderId,
                status: payload.status,
                fankonnectCommission: payload.fankonnnectComission
            }
        });
        return {
            payment,
            created
        };
    }

    async updatePayment(update, id, userId) {
        return await PaymentTable.update(update, {
            where: {
                id,
                buyerId: userId
            }
        });
    }

    async getPaymentByOrderId(orderId: string) {
        return await PaymentTable.findOne({
            where: {
                orderId
            },
            raw: true
        });
    }

    async getPaymentById(id: number) {
        return await PaymentTable.findOne({
            where: {
                id
            },
            raw: true
        });
    }

    async getPaymentByTransactionId(transactionId: string) {
        return await PaymentTable.findOne({
            where: {
                transactionId
            },
            raw: true
        });
    }

    async getPaymentByFilter(filter: any, freemium?: number) {
        let query = {
            ...filter
        };
        if (freemium) {
            query['orderId'] = 'freemium';
        } else {
            query['status'] = {
                [Op.or]: ['Attempted', 'Pending']
            };
        }
        return await PaymentTable.findOne({
            where: query,
            raw: true,
            logging: true
        });
    }

    async getTotalPurchases(groupId: string) {
        return await PaymentTable.count({
            where: {
                groupId,
                migrated: null,
                [Op.or]: [{ status: 'Success' }, { paymentStatus: 'success' }]
            }
        });
    }
}

export default new PaymentRepository();
