// import { Sequelize } from 'sequelize-typescript';
import PhoneId from '../../models/PhoneId';
import CommonRepository from '../utils/common.repository';
import RedisManager from '../../config/conf/RedisCache';
import { Op } from 'sequelize';
import GroupPhoneMap from '../../models/GroupPhoneMap';

class PhoneIdRepository extends CommonRepository {
    async findPhone(filter: any) {
        try {
            const keyName = 'whatsappPhone';
            let phoneFromRedis = await RedisManager.rPopLpush(keyName);
            console.log('keyname', keyName, phoneFromRedis);
            if (phoneFromRedis) {
                filter['id'] = Number(phoneFromRedis);
            } else {
                // set in redis

                const tokenFilter = {
                    isActive: 1
                };

                const phones = await PhoneId.findAll({
                    where: {
                        ...tokenFilter,
                        ...filter
                    },
                    attributes: ['id'],
                    logging: true
                });
                console.log('PHONES-TO-BE-ADDED', phones);
                await RedisManager.rPush(
                    keyName,
                    phones.map((x) => String(x.id))
                );
                phoneFromRedis = await RedisManager.rPopLpush(keyName);
                filter['id'] = Number(phoneFromRedis);
            }
            const phone = await PhoneId.findOne({
                where: { id: filter.id },
                raw: true,
                nest: true,
                logging: true
            });
            return phone;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findAnotherPhone(id: number) {
        try {
            const phone = await PhoneId.findOne({
                where: {
                    isActive: 1,
                    [Op.not]: { id: id }
                },
                logging: true
            });

            return phone;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findPhoneDetails(id: number) {
        try {
            const phone = await PhoneId.findOne({
                where: {
                    isActive: 1,
                    id
                },
                logging: true
            });

            return phone;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findActivePhone(groupId: number) {
        try {
            const phone = await GroupPhoneMap.findOne({
                where: {
                    isActive: 1,
                    isPrimary: 1,
                    groupId
                },
                include: [
                    {
                        model: PhoneId,
                        attributes: ['id', 'phoneId', 'phone']
                    }
                ]
            });

            return phone;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findNonprimaryPhone(groupId: number) {
        try {
            const phone = await GroupPhoneMap.findOne({
                where: {
                    isActive: 1,
                    isPrimary: 0,
                    groupId
                },
                include: [
                    {
                        model: PhoneId,
                        attributes: ['id', 'phoneId', 'phone']
                    }
                ]
            });

            return phone;
        } catch (error) {
            throw new Error(error);
        }
    }

    async createGroupPhoneMap(payload: any) {
        try {
            return await GroupPhoneMap.bulkCreate(payload);
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateGroupPhoneMap(payload: any, filter: any) {
        try {
            return await GroupPhoneMap.update(payload, { where: filter });
        } catch (error) {
            throw new Error(error);
        }
    }

    async updatePhone(payload: any, filter: any) {
        try {
            return await PhoneId.update(payload, { where: filter });
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new PhoneIdRepository();
