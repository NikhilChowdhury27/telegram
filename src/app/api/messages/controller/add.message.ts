const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import Telegram from '../../../utils/telegram/telegram.common';
import messageService from '../services/message.service';
import userRepository from '../../../repository/user.repository';
import messageRepository from '../../../repository/message.repository';
import SessionRepository from '../../../repository/session.token';
import Group from '../../../utils/group';

export default class addMessage extends MasterController {
    static doc() {
        return {
            tags: ['addMessage'],
            description: 'create locked message',
            summary: 'create locked message'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        // payload.addToBody(
        //     Joi.object().keys({
        //         viewPrice: Joi.number().min(1),
        //         lockedMessage: Joi.string().required().min(10),
        //         attachments: Joi.array().items({
        //             description: Joi.string().optional(),
        //             fileLink: Joi.string().required()
        //         }),
        //         expiry: Joi.object().keys({
        //             value: Joi.number().min(1),
        //             period: Joi.string()
        //                 .valid('day', 'month', 'year')
        //                 .required()
        //         }),
        //         visibleMessage: Joi.string().required()
        //     })
        // );
        payload.addToBody(
            Joi.object().keys({
                price: Joi.number().min(1),
                lockedMessage: Joi.string().max(500).allow(''),
                attachments: Joi.array()
                    .items({
                        fileName: Joi.string().required(),
                        fileType: Joi.string()
                            .valid('image', 'video', 'doc', 'pdf', 'file')
                            .required()
                    })
                    .optional(),
                expiry: Joi.object()
                    .keys({
                        value: Joi.number().min(1),
                        period: Joi.string()
                            .valid('day', 'month', 'year')
                            .required()
                    })
                    .optional(),
                title: Joi.string().required(),
                description: Joi.string().required()
            })
        );
        return payload;
    }

    async controller() {
        if (!this.data.attachments && !this.data.lockedMessage) {
            return new ResponseBuilder(
                400,
                {},
                'either of attachments or locked message is necessary'
            );
        }
        // const res = await messageService.add(this.data);
        const userObj = await userRepository.findOneById(this.data.user.id);
        if (!userObj) {
            return new ResponseBuilder(401, {}, 'Unauthorized');
        }
        const payload = {
            name: this.data.title,
            about: this.data.description,
            // session: userObj.session,
            userObj: userObj
        };
        console.log({ payload });
        // TODO://

        if (!userObj.telegramUserId) {
            const telegramUserRes: any = await Telegram.checkAndUpdateUser({
                mobile: userObj.mobile,
                userId: userObj.id
            });

            if (!telegramUserRes && !telegramUserRes.id) {
                return {
                    statusCode: 400,
                    message: 'Telegram User Not Found',
                    data: {}
                };
            }
            payload.userObj.telegramUserId = telegramUserRes.id;
            payload.userObj.telegramAccessHash = telegramUserRes.accessHash;
        }
        // const resp: any = await Telegram.createChannel(payload);
        // if (resp instanceof Error) {
        //     return new ResponseBuilder(
        //         500,
        //         {},
        //         'Error in sending locked message'
        //     );
        // }
        // try {
        //     await Telegram.sendMessage(
        //         this.data.lockedMessage,
        //         resp.chats[0].id,
        //         resp.chats[0].accessHash,
        //         this.data.files
        //     );
        // } catch (err) {
        //     console.error('Error in sending message to channel: ', err);
        //     return new ResponseBuilder(
        //         500,
        //         {},
        //         'Error in sending locked message'
        //     );
        // } TODO:
        // const resp = {
        //     chats: [
        //         {
        //             id: 23,
        //             accessHash: 'test hash'
        //         }
        //     ]
        // };
        // await Telegram.addUserToChannel({
        //     channelId: resp.chats[0].id,
        //     channelHash: resp.chats[0].accessHash,
        //     telegramUserId: userObj.telegramUserId,
        //     telegramAccessHash: userObj.telegramAccessHash
        // });
        // await Telegram.editAdminRights(
        //     {
        //         userId: userObj.telegramUserId,
        //         userAccessHash: userObj.telegramAccessHash
        //     },
        //     {
        //         channelId: resp.chats[0].id,
        //         channelHash: resp.chats[0].accessHash
        //     }
        // );
        const expiry = this.data.expiry;
        const expiryDate = new Date();
        let expiryMins = 0;
        if (expiry) {
            switch (expiry.period) {
                case 'day':
                    // code block
                    expiryDate.setDate(
                        expiryDate.getDate() + parseInt(expiry.value)
                    );
                    expiryMins = expiry.value * 24 * 60;
                    break;
                case 'month':
                    // code block
                    expiryDate.setMonth(
                        expiryDate.getMonth() + parseInt(expiry.value)
                    );
                    expiryMins = expiry.value * 30 * 24 * 60;
                    break;
                case 'year':
                    expiryDate.setFullYear(
                        expiryDate.getFullYear() + parseInt(expiry.value)
                    );
                    expiryMins = expiry.value * 365 * 24 * 60;
                    break;
                // code block
            }
        }
        const { id: userId } = this.data.user;
        const copyData = JSON.parse(JSON.stringify(this.data));
        const attachments = (copyData.files || []).map((item) => {
            delete item.buffer;
            return item;
        });
        const message = {
            messagePrice: this.data.price,
            lockedMessage: this.data.lockedMessage,
            attachments: JSON.stringify(attachments),
            expiryMins,
            createdBy: userId,
            visibleMessage: this.data.visibleMessage,
            title: this.data.title,
            description: this.data.description,
            channelId: 0,
            channelHash: '',
            status: 'pending'
        };
        // const userId = 123;
        const res = await messageService.add(message);
        console.log('file-1', this.data.files, this.data);
        this.checkLockedMessage(payload, this.data, res.id);
        console.log('response from db: ', res);
        const paymentLink = `${process.env.PAYMENT_DOMAIN}/m/${res.id}`;
        let shareLinks = Group.msglinks(
            res.id,
            this.data.title,
            this.data.description
        );
        return new ResponseBuilder(
            200,
            {
                id: res.id,
                messagePrice: message.messagePrice,
                paymentLink,
                channelId: message.channelId,
                attachments: message.attachments,
                visibleMessage: message.visibleMessage,
                title: message.title,
                description: message.description,
                channelHash: message.channelHash,
                shareLinks
            },
            'Created Successfully'
        );
    }

    async checkLockedMessage(payload: any, fileData: any, messageId: number) {
        const allActiveSessions =
            await SessionRepository.findAllSessionFiltered('message');
        let count = 0;
        for (const session of allActiveSessions) {
            try {
                count += 1;
                const resp: any = await Telegram.createChannel(
                    payload,
                    session
                );
                if (!resp) {
                    continue;
                }

                // send message
                await Telegram.sendMessage(
                    fileData.lockedMessage,
                    resp.chats[0].id,
                    resp.chats[0].accessHash,
                    fileData.files,
                    resp.session
                );

                if (count == allActiveSessions.length - 1) {
                    // TODO: failed scenario
                    console.log('LOCKED_MESSAGE_CREATION_FAILURE');
                    await messageRepository.failLockedMessage(messageId);
                }
                // db update
                console.log(
                    'CHANNEL-1',
                    resp.chats[0].id,
                    resp.chats[0].accessHash
                );
                await messageRepository.updateLockedMessage(
                    messageId,
                    resp.session.id,
                    resp.chats[0].id,
                    resp.chats[0].accessHash
                );

                // TODO: TO AUTOMATE TOKEN TYPE ASSIGNMENT

                // await SessionRepository.updateSessionType(
                //     'message',
                //     resp.session.id
                // );
                console.log('LOCKED_MESSAGE_CREATION_SUCCESS');
                break;
            } catch (err) {
                console.log(
                    'error while retrying locked message..',
                    err.message
                );
                if (count == allActiveSessions.length - 1) {
                    // TODO: failed scenario
                    await messageRepository.failLockedMessage(messageId);
                    console.log('LOCKED_MESSAGE_CREATION_FAILURE');
                }
                continue;
            }
        }
    }
}
