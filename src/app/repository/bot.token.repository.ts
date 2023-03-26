// import { Sequelize } from 'sequelize-typescript';
import BotToken from '../../models/BotToken';
import CommonRepository from '../utils/common.repository';
import RedisManager from '../../config/conf/RedisCache';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';

class BotRepository extends CommonRepository {
    async findBot(filter: any, botKey?: string) {
        try {
            const keyName =
                botKey || (filter.sessionId ? 'primaryBot' : 'eventBot');
            let botFromRedis = await RedisManager.rPopLpush(keyName);
            console.log('keyname', keyName, botFromRedis);
            if (botFromRedis) {
                filter['id'] = Number(botFromRedis);
            } else {
                // set in redis

                const tokenFilter = {
                    isActive: 1
                };
                if (!filter.sessionId) {
                    tokenFilter['sessionId'] = null;
                } else {
                    tokenFilter['sessionId'] = { [Op.not]: null };
                }

                const tokens = await BotToken.findAll({
                    where: {
                        ...tokenFilter,
                        type: filter.type
                    },
                    attributes: ['id'],
                    logging: true
                });
                console.log('TOKENS-TO-BE-ADDED', tokens);
                await RedisManager.rPush(
                    keyName,
                    tokens.map((x) => String(x.id))
                );
                botFromRedis = await RedisManager.rPopLpush(keyName);
                filter['id'] = Number(botFromRedis);
            }
            const token = await BotToken.findOne({
                where: { id: filter.id },
                raw: true,
                nest: true,
                logging: true
            });
            return token;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findAutomateBot() {
        try {
            const tokenFilter = {
                isActive: 1,
                type: 'automate'
            };
            // if (!filter.sessionId) {
            //     tokenFilter['sessionId'] = null;
            // } else {
            //     tokenFilter['sessionId'] = { [Op.not]: null };
            // }

            const token = await BotToken.findOne({
                where: tokenFilter,
                order: Sequelize.fn('RAND'),
                logging: false
            });

            return token;
        } catch (error) {
            throw new Error(error);
        }
    }

    // async findByValue(filter: any) {
    //     try {
    //         const token = await BotToken.findOne({
    //             where: filter,
    //             raw: true,
    //             nest: true
    //         });
    //         return token;
    //     } catch (error) {
    //         throw new Error(error);
    //     }
    // }

    async findAllSession() {
        try {
            return await BotToken.findAll({
                where: { isActive: 1 },
                raw: true,
                nest: true
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async findAllSessionFiltered(type: string) {
        try {
            return await BotToken.findAll({
                where: {
                    isActive: 1,
                    type
                },
                raw: true,
                nest: true
            });
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateSession(data: any) {
        try {
            return await BotToken.update(
                {
                    isActive: 0
                },
                {
                    where: { id: data.id }
                }
            );
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateSessionType(type: string, sessionId: string) {
        try {
            return await BotToken.update(
                {
                    type
                },
                {
                    where: { id: sessionId }
                }
            );
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new BotRepository();
