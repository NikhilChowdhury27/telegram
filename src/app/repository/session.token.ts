// import { Op, Sequelize } from 'sequelize';
import RedisManager from '../../config/conf/RedisCache';
import SessionToken from '../../models/SessionToken';
import CommonRepository from '../utils/common.repository';

class SessionRepository extends CommonRepository {
    async findSession(type?: string, sessionId?: number) {
        try {
            let session;
            if (sessionId) {
                session = await SessionToken.findOne({
                    where: {
                        id: sessionId,
                        isActive: true
                    }
                });
                return session;
            }
            if (type) {
                const newSession = await RedisManager.rPopLpush(
                    `session-${type}`
                );
                if (newSession) {
                    let HashResult = await RedisManager.getFromHashmap(
                        newSession
                    );
                    let result =
                        HashResult ||
                        (await SessionToken.findOne({
                            where: {
                                id: Number(newSession),
                                isActive: true
                            }
                        }));
                    if (!HashResult && result) {
                        await RedisManager.addToHashmap(String(result.id), {
                            id: result.id,
                            apiId: result.apiId,
                            apiHash: result.apiHash,
                            session: result.session,
                            type: result.type
                        });
                    }
                    if (!result) {
                        return false;
                    }
                    return {
                        apiId: Number(result.apiId),
                        apiHash: result.apiHash,
                        session: result.session,
                        id: Number(result.id),
                        type: result.type
                    };
                }
            }
            const allSessions = await SessionToken.findAll({
                where: {
                    type: type,
                    isActive: true
                },
                raw: false
            });
            session = allSessions.length ? allSessions[0] : false;
            for (let i = 0; i < allSessions.length; i++) {
                await Promise.all([
                    RedisManager.rPush(
                        `session-${type}`,
                        String(allSessions[i].id)
                    ),
                    RedisManager.addToHashmap(String(allSessions[i].id), {
                        id: allSessions[i].id,
                        apiId: allSessions[i].apiId,
                        apiHash: allSessions[i].apiHash,
                        session: allSessions[i].session,
                        type: allSessions[i].type
                    })
                ]);
            }

            return session;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findAllSession() {
        try {
            return await SessionToken.findAll({
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
            return await SessionToken.findAll({
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
            return await SessionToken.update(
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
            return await SessionToken.update(
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

export default new SessionRepository();
