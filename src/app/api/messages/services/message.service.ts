import messageRepository from '../../../repository/message.repository';
import CommonService from '../../../utils/common.service';
import { sequelize } from '../../../../sequelize';
import MemberMessageMap from '../../../../models/MemberMessageMap';
import LockedMessage from '../../../../models/LockedMessageDetail';
import { ALREADY_A_MEMBER } from '../../../../config/constants/errorMessages';
import messageMemberService from '../../messageMembers/services/message.member';
// import userRepository from '../../../repository/user.repository';
import memberMessageMap from '../../../repository/member.message.map';
import Telegram from '../../../utils/telegram/telegram.common';
import { QueryTypes } from 'sequelize';

class messageService extends CommonService {
    async add(payload: any) {
        return await messageRepository.create(payload);
    }

    async get(payload: any, userId?: number) {
        const { messageId, limit, offset } = payload;
        console.log('PAGINATION', limit, offset);
        let filter = {};
        const projection = {
            LockedMessage: {
                attributes: ['id']
            }
        };
        if (messageId) {
            filter = {
                id: messageId
            };
            if (userId) {
                filter['createdBy'] = userId;
            }
        } else {
            filter = {
                createdBy: userId
            };
        }
        const res = await messageRepository.get(
            filter,
            projection,
            limit ? (isNaN(Number(limit)) ? 100 : Number(limit)) : 100,
            offset ? (isNaN(Number(offset)) ? 0 : Number(offset)) : 0
        );
        return res && res.length ? res : [];
        return {
            id: 123,
            viewPrice: '',
            lockedMessage: '', // hide this in case user has not bought it
            attachments: [
                // hide this in case user has not bought it
                {
                    description: '',
                    fileLink: 'fileLink'
                }
            ],
            visibleMessage: ''
        };
    }

    async addMembers(userId, messageId, paymentId, pricePaid) {
        let messageDetails = await this.get({ messageId });
        messageDetails = messageDetails ? messageDetails[0] : null;
        if (!messageDetails) {
            throw new Error('Message not found');
        }
        const memberShipDetails =
            await messageMemberService.checkMessageMembership(
                userId,
                messageId,
                {
                    paymentId,
                    status: 'active'
                }
            );
        if (memberShipDetails && memberShipDetails.data) {
            throw new Error(ALREADY_A_MEMBER);
        }
        const message = {
            memberId: userId,
            messageId,
            paymentId,
            status: 'active',
            isAdded: 1,
            membershipStatus: 'pending'
        };
        // const user = await userRepository.findOneById(userId);
        // const telegramPayload: any = {
        //     channelId: messageDetails['channelId'],
        //     channelHash: messageDetails['channelHash'],
        //     telegramUserId: user.telegramUserId,
        //     telegramAccessHash: user.telegramAccessHash
        // };
        // try {
        //     await Telegram.addUserToChannel(telegramPayload);
        // } catch (err1) {
        //     err1 = err1.message;
        //     err1 = err1.substring(499);
        //     console.log(err1.length);
        //     // memeber group mapping entry with new status column  and error meesgae
        //     message['isAdded'] = 0;
        //     message['errorMsg'] = err1;
        // }
        const t = await sequelize.transaction();
        try {
            await MemberMessageMap.create(<any>message, { transaction: t });
            // await sequelize.query(
            //     `update member_message_map set members = members + 1, revenue = revenue + ${pricePaid} where id = ${messageId}`
            // );
            await LockedMessage.update(
                {
                    members: sequelize.literal('members + 1'),
                    revenue: sequelize.literal(`revenue + ${pricePaid}`)
                },
                {
                    where: {
                        id: messageId
                    },
                    transaction: t
                }
            );
            await t.commit();
        } catch (err) {
            await t.rollback();
            console.error('Error in transaction: ', err);
            throw err;
        }
    }

    async findMessageById(messageId) {
        return await LockedMessage.findOne({
            where: {
                id: messageId
            },
            raw: true
        });
    }

    async findMessageCreatorById(messageId) {
        return await sequelize.query(
            `SELECT u.name from locked_message_details AS l INNER JOIN users AS u on u.id=l.createdBy WHERE l.id=${messageId}`,
            {
                type: QueryTypes.SELECT
            }
        );
    }

    async edit(updateFields, filter) {
        return await LockedMessage.update(updateFields, { where: filter });
    }

    async retryAddLockedMessage() {
        try {
            const usersToRetryAdd: any = await sequelize.query(
                `
				SELECT mmm.id, u.telegramAccessHash, u.telegramUserId, lm.channelHash, lm.channelId, mmm.memberId, mmm.messageId, st.session, st.apiId, st.apiHash
				from member_message_map mmm 
				INNER JOIN users u ON u.id = mmm.memberId 
				INNER JOIN locked_message_details lm ON lm.id = mmm.messageId
				INNER JOIN session_token st ON st.id = lm.sessionId
				WHERE mmm.membershipStatus='pending' ORDER BY createdAt DESC limit 2 `,
                { type: QueryTypes.SELECT }
            );
            console.log('Retrying to add in locked message', usersToRetryAdd);

            for (const value of usersToRetryAdd) {
                if (!value.telegramUserId) {
                    const telegramUserRes: any =
                        await Telegram.checkAndUpdateUser({
                            mobile: value.mobile,
                            userId: value.userId
                        });

                    if (!telegramUserRes && !telegramUserRes.id) {
                        continue;
                    }
                    value.telegramUserId = telegramUserRes.id;
                    value.telegramAccessHash = telegramUserRes.accessHash;
                }
                const payload = {
                    channelId: value.channelId,
                    channelHash: value.channelHash,
                    telegramUserId: value.telegramUserId,
                    telegramAccessHash: value.telegramAccessHash
                };
                await this.addUserToMessageCallback({
                    telegramPayload: payload,
                    member: {
                        messageId: value.messageId,
                        memberId: value.memberId
                    },
                    session: {
                        session: value.session,
                        apiId: value.apiId,
                        apiHash: value.apiHash
                    }
                });

                setTimeout(() => {}, 30000);
            }
            return;
        } catch (error) {
            throw error;
        }
    }

    addUserToMessageCallback = async (payload: any) => {
        try {
            console.log('ADD Message', payload);
            const response = await Telegram.addUserToChannel(
                payload.telegramPayload,
                undefined,
                payload.session
            );
            if (!response) {
                return;
            }
            // update member_message_map
            const member = payload.member;
            // perform update operation
            console.log('AFTER SUB', member);
            await memberMessageMap.updateMessageMemberStatus(member, 'success');
        } catch (err) {
            console.log(err.message);
        }
    };
}

export default new messageService();
