import CommonRepository from '../utils/common.repository';
import GroupBotMap from '../../models/groupBotMap';
import BotToken from '../../models/BotToken';

class GroupBotMapRepository extends CommonRepository {
    async findOne(filter: any) {
        try {
            const mapping = await GroupBotMap.findOne({
                where: filter,
                raw: true,
                nest: true,
                include: [
                    {
                        model: BotToken,
                        attributes: ['id', 'token', 'telegramId']
                    }
                ]
            });
            return mapping;
        } catch (error) {
            throw new Error(error);
        }
    }

    async createGroupBotMap(payload: any) {
        try {
            let groupMap = new GroupBotMap();
            groupMap.botTokenId = payload.botTokenId;
            groupMap.groupId = payload.groupId;
            groupMap.isActive = payload.isActive;
            groupMap.isPrimary = payload.isPrimary;
            return await groupMap.save();
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateGroupBotMap(payload: any, filter: any) {
        try {
            return await GroupBotMap.update(payload, {
                where: filter
            });
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new GroupBotMapRepository();
