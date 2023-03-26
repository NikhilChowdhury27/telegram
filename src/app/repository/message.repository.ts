import CommonRepository from '../utils/common.repository';
import LockedMessage from '../../models/LockedMessageDetail';
import { Sequelize } from 'sequelize';
export class messageRepository extends CommonRepository {
    async create(payload: any) {
        let messageData = new LockedMessage();
        messageData.messagePrice = payload.messagePrice;
        // messageData.visibleMessage = payload.visibleMessage;
        messageData.title = payload.title;
        messageData.description = payload.description;
        messageData.lockedMessage = payload.lockedMessage;
        messageData.attachments = payload.attachments;
        messageData.offers = payload.offers || '';
        messageData.createdBy = payload.createdBy;
        messageData.expiryMins = payload.expiryMins;
        messageData.channelId = payload.channelId;
        messageData.channelHash = payload.channelHash;
        messageData.status = payload.status;
        return await messageData.save();
    }

    async get(filter, project, limit?: number | null, offset?: number | null) {
        return await LockedMessage.findAll({
            where: filter,
            order: [['createdAt', 'DESC']],
            attributes: project,
            logging: false,
            limit,
            offset,
            raw: true
        });
    }

    async findMessageById(messageId: number) {
        let data = await LockedMessage.findOne({
            where: {
                id: messageId,
                isActive: true
            },
            raw: true
        });
        return data;
    }

    async totalRevenue(userId) {
        return LockedMessage.findAll({
            where: {
                createdBy: userId
            },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('revenue')), 'total']
            ],
            raw: true
        });
    }

    async allCreatedLockedMessages(userId) {
        return LockedMessage.findAll({
            where: {
                createdBy: userId
            },
            attributes: ['id'],
            raw: true
        });
    }

    async updateLockedMessage(
        messageId: number,
        sessionId: number,
        channelId?: number,
        channelHash?: string
    ) {
        await LockedMessage.update(
            {
                status: 'success',
                sessionId: sessionId || null,
                channelId,
                channelHash
            },
            {
                where: {
                    id: messageId
                }
            }
        );
    }

    async failLockedMessage(messageId: number) {
        await LockedMessage.update(
            {
                status: 'failed'
            },
            {
                where: {
                    id: messageId
                }
            }
        );
    }
}

export default new messageRepository();
