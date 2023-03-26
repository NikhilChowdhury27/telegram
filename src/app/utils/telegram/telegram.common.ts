// @ts-nocheck
import { Api, client, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
const bigInt = require('big-integer');
import input from 'input';
import { AuthKey } from 'telegram/crypto/AuthKey';
// import { IJoinGroup } from '../../api/groups/group.interface';
const BOT_TOKEN = '5371169753:AAHAmaKvsrAhcJLke3YV39WsxzwP8DPAbwk';
const GOLBAL_SESSION = process.env.GLOBAL_SESSION;
const apiId = process.env.apiId;
const apiHash = process.env.apiHash;
import SessionRepository from '../../repository/session.token';
import Group from '../../utils/group';
// import GroupDetailsRepository from '../../repository/group.repository';
import UserRepository from '../../repository/user.repository';
import botTokenRepository from '../../repository/bot.token.repository';
import groupBotRepository from '../../repository/group.bot.map.repository';
import memberGroupMap from '../../repository/member.group.map';
import { sendNotificationToGoogleChat } from '../alert.utils';
import { CHAT_URL } from '../../../config/constant';
// import { AutoIncrement } from 'sequelize-typescript';
const { CustomFile } = require('telegram/client/uploads');
const axios = require('axios');
// const stringSession =
// 	'1BQANOTEuMTA4LjU2LjE2MQG7Pc99fQdGvu/f06ZtCex68Jr5eTCBA4YUjoj90Ggh5eWQSjSmkOkKMteanKYsu0TTlQGTcXjjpwYiAyyc/kPTaZZOhJ3qpS1pykePQm2zN4xKHAMU3EyVKiKCYOKzZqHHKhB8vR43GeEbIGtytG7EEUYVDZ5VZZ81SL4XjcC8g9+hUo+5K8/zS9k9CBJXC8AeGhG49CfMLRcUmKXqNQWLSJhJ2HnOgAUSp1FUaSvMz6zwPzAdHHNe2nw89V0oN4fLtUQSrXQfxWOCES4/HCq8VgU3gKMXOOOAzxF6NYIvuFCO4VDQisW/dNBhkplCcKyEBUWanvtZVrLxu2j9UvyTtg==';
export default class telegram {
    // TODO : THis nesds to be created at FE we will only send apiId and apiHash
    static async createUserSession() {
        const session = '';
        const client = new TelegramClient(
            new StringSession(session),
            parseInt(apiId), // 14320533,
            apiHash, // '192db7fb339420314bef52629b25533e',
            { connectionRetries: 5 }
        );
        await client.start({
            phoneNumber: async () => await input.text('Code ?'),
            phoneCode: async () => await input.text('Code ?'),
            onError: (err) => console.log(err)
        });
        const parseInfo = JSON.parse(JSON.stringify(client.session));
        const bufferInfo = Buffer.from(parseInfo._authKey._key);
        console.log('savedSession', client.session.save()); // Save this string to avoid logging in again
        console.log('clientInfo', client);
        console.log('clientInfo', client.session.authKey);
        console.log('clientInfo1', bufferInfo.toString('base64'));
        console.log('clientInfo', client.session.authKey);
        console.log(new AuthKey().getKey());
    }

    static createChannel = async (
        payload: any,
        session?: any,
        type?: string,
        pregroup?: boolean,
        botAddition?: boolean
    ) => {
        let client;
        try {
            const { name, about, userObj, sessionId, inviteLink } = payload;
            console.log('create channel payload :: ', payload, session);
            const sessionRes = await SessionRepository.findSession(
                type,
                sessionId
            );

            const [botToken, existingBotToken, primaryBot, secondaryBot] =
                await Promise.all([
                    botTokenRepository.findBot({
                        isActive: 1,
                        type,
                        sessionId: !botAddition ? sessionRes.id : null
                    }),
                    botAddition &&
                        groupBotRepository.findOne({
                            groupId: payload.groupId,
                            isPrimary: 0
                        }),
                    !inviteLink &&
                        payload.groupId &&
                        groupBotRepository.findOne({
                            groupId: payload.groupId,
                            isPrimary: 1
                        }),
                    !botAddition &&
                        !pregroup &&
                        botTokenRepository.findBot({
                            isActive: 1,
                            type,
                            sessionId: null
                        })
                ]);

            console.log('bot Token', existingBotToken, botToken, sessionRes.id);
            // this is static channel id to fetch participants to let client see the bot

            client = await this.createTelegramSession(sessionRes);
            await this.sleep(2000);
            console.log('BOT_MAP_CHANNEL_ID', process.env.BOT_MAP_CHANNEL_ID);
            // const participants = await client.getParticipants(
            //     new Api.PeerChannel({
            //         channelId: process.env.BOT_MAP_CHANNEL_ID
            //     })
            // );

            const participants = await client.invoke(
                new Api.channels.GetParticipants({
                    channel: new Api.PeerChannel({
                        channelId: process.env.BOT_MAP_CHANNEL_ID
                    }),
                    limit: 100,
                    filter: new Api.ChannelParticipantsSearch({
                        q: ''
                    }),
                    hash: 0,
                    offset: 0
                })
            );

            console.log(
                'participants',
                participants.users.find(
                    (x) => parseInt(x.id) === botToken.telegramId
                )
            );

            const result: any = !payload.channelId
                ? await client.invoke(
                      new Api.channels.CreateChannel({
                          title: name,
                          about: '',
                          megagroup: false

                          // forImport: true,
                          // geoPoint: new Api.InputGeoPoint({
                          // 	lat: 8.24,
                          // 	long: 8.24,
                          // 	accuracyRadius: 43
                          // }),
                          // address: 'some string here'
                      })
                  )
                : undefined;

            // megagroup

            // await client.invoke(
            //     new Api.messages.EditChatDefaultBannedRights({
            //         peer: new Api.InputChannel({
            //             channelId: result.chats[0].id,
            //             accessHash: result.chats[0].accessHash
            //         }),
            //         bannedRights: new Api.ChatBannedRights({
            //             sendMessages: true,
            //             // untilDate: Math.round(
            //             //     (new Date().getTime() + 20000) / 1000
            //             // )
            //             untilDate: 0
            //         })
            //     })
            // );

            // megaend

            // make bot an admin TODO:
            const channelId = result ? result.chats[0].id : payload.channelId;
            const channelHash = result
                ? result.chats[0].accessHash
                : payload.channelHash;
            console.log(
                result ? 'channel created:::' : 'channel fetched:::',
                result && result.chats[0].title,
                channelId,
                channelHash
            );
            await this.sleep(2000);
            const result1 = await client.invoke(
                new Api.channels.EditAdmin({
                    channel: new Api.PeerChannel({
                        channelId: channelId
                    }),
                    userId: new Api.PeerUser({
                        userId: existingBotToken
                            ? existingBotToken.botToken.telegramId
                            : botToken.telegramId
                    }),
                    adminRights: new Api.ChatAdminRights({
                        changeInfo: true,
                        postMessages: true,
                        editMessages: true,
                        deleteMessages: true,
                        banUsers: true,
                        inviteUsers: true,
                        pinMessages: true,

                        addAdmins: true,
                        anonymous: true,
                        manageCall: true
                    }),
                    rank: 'Admin'
                })
            );

            console.log(
                'Made Admin Bot -->',
                botToken.id,
                existingBotToken && existingBotToken.botToken.id,
                JSON.stringify(result1)
            );
            const token = primaryBot
                ? primaryBot.botToken.token
                : botToken.token;

            botAddition ? await this.sleep(5000) : await this.sleep(3000);

            if (!botAddition && !pregroup && !sessionId) {
                const tokenId = existingBotToken
                    ? existingBotToken.botToken.telegramId
                    : secondaryBot.telegramId;
                await client.invoke(
                    new Api.channels.EditAdmin({
                        channel: new Api.PeerChannel({
                            channelId: channelId
                        }),
                        userId: new Api.PeerUser({
                            userId: tokenId
                        }),
                        adminRights: new Api.ChatAdminRights({
                            changeInfo: true,
                            postMessages: true,
                            editMessages: true,
                            deleteMessages: true,
                            banUsers: true,
                            inviteUsers: true,
                            pinMessages: true,

                            addAdmins: true,
                            anonymous: true,
                            manageCall: true
                        }),
                        rank: 'Admin'
                    })
                );
                await groupBotRepository.createGroupBotMap({
                    isActive: 1,
                    isPrimary: 0,
                    groupId: payload.groupId,
                    botTokenId: secondaryBot.id
                });
                await this.sleep(4000);
            }

            const inviteLinkGen = !inviteLink
                ? await this.createInviteLinkBot(
                      channelId,

                      token,
                      true
                  )
                : inviteLink;

            console.log('CHANNEL CREATED, INVITE LINK ::: ', inviteLinkGen);
            // await this.sleep();
            // const addUserRes = await this.addUserToChannel(
            //     {
            //         channelId: result.chats[0].id,
            //         channelHash: result.chats[0].accessHash,
            //         telegramUserId: userObj.telegramUserId,
            //         telegramAccessHash: userObj.telegramAccessHash
            //     },
            //     client
            // );
            // console.log('ADD_USER_RES :: ', JSON.stringify(addUserRes));
            // if (!addUserRes) {
            //     throw new Error('Failed to add user to channel');
            // }
            // await this.sleep();
            // const adminRes = await this.editAdminRights(
            //     {
            //         userId: userObj.telegramUserId,
            //         userAccessHash: userObj.telegramAccessHash
            //     },
            //     {
            //         channelId: result.chats[0].id,
            //         channelHash: result.chats[0].accessHash
            //     },
            //     client
            // );
            // console.log('EDIT_ADMIN_RIGHTS :: ', JSON.stringify(adminRes));

            // if (!adminRes) {
            //     throw new Error('Failed to add admin rights for user');
            // }

            console.log('channel response', JSON.stringify(result));
            inviteLinkGen &&
                !pregroup &&
                !botAddition &&
                Group.sendSms(
                    [userObj.mobile],
                    userObj.userId,
                    undefined,
                    payload.groupId,
                    {
                        groupAdmin: userObj.name,
                        inviteLink: encodeURIComponent(
                            encodeURIComponent(inviteLinkGen)
                        ),
                        channelName: name
                    },
                    process.env.COMM_ACCESS_SMS_GROUP_CREATED,
                    'groupCreated'
                );

            const emailTemplateData = {
                userName: userObj.name,
                accountName: name,
                groupName: name,
                telegramChannelLink: inviteLinkGen,
                adminName: userObj.name
            };
            userObj.email &&
                (await Group.sendEmail(
                    [userObj.email],
                    process.env.COMM_ACCESS_EMAIL_GROUP_CREATED,
                    Number(
                        process.env.COMM_ACCESS_EMAIL_GROUP_CREATED_TEMPLATE
                    ),
                    null,
                    // userObj.id,
                    // createdResult.id,
                    emailTemplateData
                ));

            if (client) {
                await client.destroy();
            }
            return {
                channel: {
                    channelId,
                    channelHash
                },
                session: sessionRes,
                inviteLink: inviteLinkGen,
                botToken: existingBotToken
                    ? existingBotToken.botToken.id
                    : botToken.id,
                secondaryBot: Boolean(existingBotToken),
                token: existingBotToken
                    ? existingBotToken.botToken.token
                    : botToken.token
            };
            // await client.sendMessage('me', { message: 'Hello!' });
        } catch (e) {
            if (client) {
                await client.destroy();
            }

            sendNotificationToGoogleChat(CHAT_URL, {
                source: 'CREATE_CHANNEL',
                context: { action: 'CREATE_CHANNEL' },
                error: JSON.stringify(e)
            });

            console.log('telegram create channel error', e);
            // TODO: changed recently, might not need
            // if (e.errorMessage && e.errorMessage == 'AUTH_KEY_DUPLICATED') {
            //     console.log('DHAMAKA');
            //     await SessionRepository.updateSession(sessionRes);
            // }
            // throw new Error('Failed to create channel');
        }
    };

    static addRemovalBotInChannel = async (payload: any, type?: string) => {
        let client;
        try {
            const { sessionId } = payload;
            console.log('channel payload :: ', payload);
            const sessionRes = await SessionRepository.findSession(
                'group',
                sessionId
            );

            const removalBot = await botTokenRepository.findBot(
                {
                    isActive: 1,
                    type,
                    sessionId: sessionRes.id
                },
                'removalBot'
            );

            console.log('removal bot Token', removalBot, sessionRes);
            // this is static channel id to fetch participants to let client see the bot

            client = await this.createTelegramSession(sessionRes);
            await this.sleep(2000);
            console.log('BOT_MAP_CHANNEL_ID', process.env.BOT_MAP_CHANNEL_ID);

            const participants = await client.invoke(
                new Api.channels.GetParticipants({
                    channel: new Api.PeerChannel({
                        channelId: process.env.BOT_MAP_CHANNEL_ID
                    }),
                    limit: 100,
                    filter: new Api.ChannelParticipantsSearch({
                        q: ''
                    }),
                    hash: 0,
                    offset: 0
                })
            );

            console.log(
                'participants',
                participants.users.find(
                    (x) => parseInt(x.id) === removalBot.telegramId
                )
            );

            // make bot an admin TODO:

            await this.sleep(2000);
            const result1 = await client.invoke(
                new Api.channels.EditAdmin({
                    channel: new Api.PeerChannel({
                        channelId: payload.channelId
                    }),
                    userId: new Api.PeerUser({
                        userId: removalBot.telegramId
                    }),
                    adminRights: new Api.ChatAdminRights({
                        changeInfo: true,
                        postMessages: true,
                        editMessages: true,
                        deleteMessages: true,
                        banUsers: true,
                        inviteUsers: true,
                        pinMessages: true,

                        addAdmins: true,
                        anonymous: true,
                        manageCall: true
                    }),
                    rank: 'Admin'
                })
            );

            console.log('Made Admin Bot -->', removalBot);

            return {
                botId: removalBot.id,
                token: removalBot.token
            };
        } catch (e) {
            if (client) {
                await client.destroy();
            }

            console.log('telegram removal bot addition in channel error', e);
        }
    };

    static addListenerBotInChannel = async (payload: any, type?: string) => {
        let client;
        try {
            const { sessionId } = payload;
            console.log('channel payload :: ', payload);
            const sessionRes = await SessionRepository.findSession(
                'group',
                sessionId
            );

            const removalBot = await botTokenRepository.findBot(
                {
                    isActive: 1,
                    type,
                    sessionId: null
                },
                'eventBot'
            );

            console.log('event bot Token', removalBot, sessionRes);
            // this is static channel id to fetch participants to let client see the bot

            client = await this.createTelegramSession(sessionRes);
            await this.sleep(2000);
            console.log('BOT_MAP_CHANNEL_ID', process.env.BOT_MAP_CHANNEL_ID);

            const participants = await client.invoke(
                new Api.channels.GetParticipants({
                    channel: new Api.PeerChannel({
                        channelId: process.env.BOT_MAP_CHANNEL_ID
                    }),
                    limit: 100,
                    filter: new Api.ChannelParticipantsSearch({
                        q: ''
                    }),
                    hash: 0,
                    offset: 0
                })
            );

            console.log(
                'participants',
                participants.users.find(
                    (x) => parseInt(x.id) === removalBot.telegramId
                )
            );

            // make bot an admin TODO:

            await this.sleep(2000);
            const result1 = await client.invoke(
                new Api.channels.EditAdmin({
                    channel: new Api.PeerChannel({
                        channelId: payload.channelId
                    }),
                    userId: new Api.PeerUser({
                        userId: removalBot.telegramId
                    }),
                    adminRights: new Api.ChatAdminRights({
                        changeInfo: true,
                        postMessages: true,
                        editMessages: true,
                        deleteMessages: true,
                        banUsers: true,
                        inviteUsers: true,
                        pinMessages: true,

                        addAdmins: true,
                        anonymous: true,
                        manageCall: true
                    }),
                    rank: 'Admin'
                })
            );

            console.log('Made Admin Bot -->', removalBot);

            return {
                botId: removalBot.id,
                token: removalBot.token
            };
        } catch (e) {
            if (client) {
                await client.destroy();
            }

            console.log('telegram removal bot addition in channel error', e);
        }
    };

    static async createInviteLink(payload: any, session: any, client: any) {
        const acualclient =
            client || (await this.createTelegramSession(session));
        try {
            const invite = await acualclient.invoke(
                new Api.messages.ExportChatInvite({
                    peer: new Api.InputPeerChannel({
                        channelId: payload.channelId,
                        accessHash: payload.channelHash
                    }),
                    // expireDate: 3600,
                    usageLimit: 1
                })
            );
            console.log('CHANNEL CREATED ::: ', invite['link']);
            if (!client) {
                await acualclient.destroy();
            }
            return invite['link'];
        } catch (err) {
            await client.destroy();
            console.log('telegram create Invite link via token error', err);
        }
    }

    static async createInviteLinkBot(
        chatId: any,
        botToken: string,
        expire?: false,
        approval?: number
    ) {
        try {
            let headersList = {
                'Content-Type': 'application/json'
            };
            // const unixTimestamp =
            //     Math.round(new Date().getTime() / 1000) + 604800;

            const url = approval
                ? `https://api.telegram.org/bot${botToken}/createChatInviteLink?chat_id=-100${chatId}&creates_join_request=True&expire_date=0`
                : `https://api.telegram.org/bot${botToken}/createChatInviteLink?chat_id=-100${chatId}&member_limit=1&expire_date=0`;

            const data = await axios.get(url, {
                headers: headersList
            });
            console.log(
                'INVITE LINK CREATED ::: ',
                data.data['result'].invite_link
            );

            return data.data['result'].invite_link;
        } catch (err) {
            sendNotificationToGoogleChat(CHAT_URL, {
                source: err.config.url,
                error: err.response.data
            });
            console.log('create invite link via bot error', err);
        }
    }

    static async checkAndUpdateUser(userObj: any, clientInstance?: any) {
        const { mobile, id } = userObj;
        const sessionRes = await SessionRepository.findSession('userCheck');
        const client = await this.createTelegramSession(sessionRes);
        try {
            const telegramUserRes: any = await this.findUserDetailsOnTelegram(
                {
                    telegramMobileNo: mobile
                },
                client
            );
            console.log(
                'telegramUserRes while Creating Group :: ',
                telegramUserRes,
                clientInstance
            );
            if (!telegramUserRes) {
                return {
                    statusCode: 400,
                    message: 'Telegram User Not Found',
                    data: {}
                };
            }
            await UserRepository.updateUser(
                { id: id },
                {
                    telegramUsername: telegramUserRes.username,
                    telegramUserId: telegramUserRes.id,
                    telegramAccessHash: telegramUserRes.accessHash
                }
            );
            if (client) {
                await client.destroy();
            }
            return {
                telegramUserId: telegramUserRes.id,
                telegramAccessHash: telegramUserRes.accessHash
            };
        } catch (err) {
            if (client) {
                await client.destroy();
            }
            console.log('telegram check and update user err', err);
        }
    }

    static async getChannelInfo() {
        const session = new StringSession(GOLBAL_SESSION);
        const client = new TelegramClient(
            session,
            14320533,
            '192db7fb339420314bef52629b25533e',
            {}
        );
        await client.start({
            botAuthToken: BOT_TOKEN
        });
        await client.connect(); // This assumes you have already authenticated with .start()

        const result = await client.invoke(
            new Api.channels.GetChannels({
                id: [
                    new Api.InputChannel({
                        channelId: bigInt('1788264933'),
                        accessHash: bigInt('1571569402680309684')
                    })
                ]
            })
        );
        await client.destroy();
        console.log(result.chats); // prints the result
    }

    static addUserToChannel = async (
        payload: any,
        actualClient?: any,
        session?: any
    ) => {
        const client =
            actualClient || (await this.createTelegramSession(session));
        try {
            const {
                telegramUserId,
                telegramAccessHash,
                channelId,
                channelHash
            } = payload; // session, channelId, channelHash,

            const result = await client.invoke(
                new Api.channels.InviteToChannel({
                    channel: new Api.InputChannel({
                        channelId: channelId,
                        accessHash: channelHash
                    }),
                    users: [
                        new Api.InputUser({
                            userId: telegramUserId,
                            accessHash: telegramAccessHash
                        })
                    ]
                })
            ); // prints the result
            if (!actualClient) {
                await client.destroy();
            }
            console.log('result :: ', result);
            return result;
        } catch (err) {
            await client.destroy();
            console.log('telegram add to channel error', err);
            return false;
            // throw new Error('Failed to add channel : ' + JSON.stringify(err));
        }
    };

    static async banUserToChannel(payload: any, session?: any) {
        const { channelId, channelHash, userId, userAccessHash } = payload;
        const client = await this.createTelegramSession(session);
        try {
            console.log('Test returning.....', channelId, channelHash);
            const result = await client.invoke(
                new Api.channels.EditBanned({
                    channel: new Api.InputChannel({
                        channelId: channelId,
                        accessHash: channelHash
                    }),
                    participant: new Api.InputUser({
                        userId: userId,
                        accessHash: userAccessHash
                    }),
                    bannedRights: new Api.ChatBannedRights({
                        viewMessages: true,
                        sendMessages: true,
                        sendMedia: false,
                        sendStickers: false,
                        sendGifs: false,
                        sendGames: false,
                        sendInline: false,
                        sendPolls: false,
                        changeInfo: false,
                        inviteUsers: false,
                        pinMessages: false,
                        untilDate: 0
                    })
                })
            );
            await client.destroy();
            return result;
        } catch (err) {
            await client.destroy();
            console.log('telegram ban user to channel error', err);
            throw new Error('Failed to ban user to channel');
        }
    }

    static async checkUserOnTelegram(payload: any) {
        const { telegramUsername } = payload;
        const sessionRes = await SessionRepository.findSession('userCheck');
        const client = await this.createTelegramSession(sessionRes);
        try {
            const resp = await client.getEntity(`@${telegramUsername}`);
            console.log('checkUserOnTelegram resp', resp);

            await client.destroy();
            return resp;
        } catch (err) {
            await client.destroy();
            console.log('telegram check username err', err);
            return false;
        }
    }

    static async findUserDetailsOnTelegram(payload: any, actualClient?: any) {
        const { telegramMobileNo } = payload;
        let sessionRes;
        if (!actualClient) {
            sessionRes = await SessionRepository.findSession('userCheck');
        }

        const client =
            actualClient || (await this.createTelegramSession(sessionRes));
        try {
            const resp = await client.invoke(
                new Api.contacts.ImportContacts({
                    contacts: [
                        new Api.InputPhoneContact({
                            clientId: bigInt(
                                Math.floor(999999 * Math.random())
                            ),
                            phone: telegramMobileNo,
                            firstName: '',
                            lastName: ''
                        })
                    ]
                })
            );
            if (client) {
                await client.destroy();
            }
            if (resp.users && resp.users.length > 0) {
                return resp.users[0];
            }
            return false;
        } catch (err) {
            if (client) {
                await client.destroy();
            }
            console.log('telegram check username err', err);
            return false;
        }
    }

    static async editAdminRights(user: any, channel: any, actualClient?: any) {
        const { userId, userAccessHash } = user;
        const { channelId, channelHash } = channel;
        const client = actualClient || (await this.createTelegramSession());
        try {
            const result = await client.invoke(
                new Api.channels.EditAdmin({
                    channel: new Api.InputChannel({
                        channelId: channelId,
                        accessHash: channelHash
                    }),
                    userId: new Api.InputUser({
                        userId: userId,
                        accessHash: userAccessHash
                    }),
                    adminRights: new Api.ChatAdminRights({
                        changeInfo: true,
                        postMessages: true,
                        editMessages: true,
                        deleteMessages: true,
                        banUsers: true,
                        inviteUsers: true,
                        pinMessages: true,
                        addAdmins: true,
                        anonymous: true,
                        manageCall: true,
                        other: true
                    }),
                    rank: 'Owner'
                })
            );

            if (!actualClient) {
                await client.destroy();
            }
            return result;
        } catch (err) {
            await client.destroy();
            console.log('telegram edit admin rights', err);
            // throw new Error('Failed to edit admin rights to channel');
        }
    }

    static async editAdminRightsViaBot(
        userId: any,
        channelId: any,
        botToken?: string,
        approval?: number
    ) {
        // const client = actualClient || (await this.createTelegramSession());
        try {
            //

            let headersList = {
                Accept: '*/*',
                'Content-Type': 'application/json'
            };

            let bodyContent = {
                chat_id:
                    channelId > 0 ? parseInt('-100' + channelId) : channelId,
                user_id: userId,
                is_anonymous: true,
                can_manage_chat: true,
                can_post_messages: true,
                can_edit_messages: true,
                can_delete_messages: true,
                can_restrict_members: false,
                can_manage_video_chats: true,
                can_promote_members: false,
                can_change_info: true,
                can_pin_messages: true,
                can_invite_users: Boolean(approval)
            };
            console.log('edit admin rights body', bodyContent);

            let reqOptions = {
                url: `https://api.telegram.org/bot${botToken}/promoteChatMember`,
                method: 'POST',
                headers: headersList,
                data: bodyContent
            };

            const result = await axios.request(reqOptions);

            //
            if (!result || !result.data || !result.data['result']) {
                return false;
            }
            console.log('EDIT_ADMIN_RESPONSE', result.data);

            return result.data['result'];
        } catch (err) {
            sendNotificationToGoogleChat(CHAT_URL, {
                source: err.config.url,
                context: { action: 'EDIT_ADMIN_BOT' },
                error: err.response.data
            });
            console.log('telegram edit admin rights via bot', err);
            // throw new Error('Failed to edit admin rights to channel');
        }
    }

    static async createTelegramSession(session?: any) {
        // if (client) {
        //     return client;
        // }
        try {
            console.log('SESSION received', session);
            const sessionRes =
                session || (await SessionRepository.findSession());
            console.log('session Found :: ', sessionRes);
            const client = new TelegramClient(
                new StringSession(sessionRes.session),
                sessionRes.apiId,
                sessionRes.apiHash,
                {
                    connectionRetries: 5
                }
            );
            await client.connect(); // This assumes you have already authenticated with .start()
            return client;
        } catch (error) {
            console.log('error in generating client:: ', error);
            throw new Error('Error in creating session');
        }
    }

    static async sendMessage(
        message,
        channelId,
        accessHash,
        attachments,
        session?: any
    ) {
        console.log('sending message ::');
        const client = await this.createTelegramSession(session);
        try {
            const files = (attachments || []).map((attachment) => {
                return new CustomFile(
                    attachment.originalname,
                    attachment.size,
                    '',
                    attachment.buffer
                );
            });
            const values = {
                message,
                file: files && files.length && files
            };
            if (files && files.length > 0) {
                values.file = files;
            }
            await client.sendMessage(
                new Api.InputChannel({
                    channelId: bigInt(channelId),
                    accessHash: bigInt(accessHash)
                }),
                values
                // {
                //     message: 'Hey, Testing msg'
                //     // file: '/Users/prateek-classplus/Desktop/Screenshot 2022-05-12 at 1.16.36 AM.png'
                // }
                // new Api.Message({
                // 	id: Math.floor(999999 * Math.random()),
                // 	// message:'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8&w=1000&q=80'
                // 	// id: 242364635453,
                // 	message
                // 	// file:
                // })
            );
            await client.destroy();
        } catch (err) {
            await client.destroy();
            console.log('Error while sending message..', err.message);
            throw err;
        }
    }

    static async editChannetTitle(title, channelId, accessHash) {
        const client = await this.createTelegramSession();
        try {
            await client.invoke(
                new Api.channels.EditTitle({
                    channel: new Api.InputChannel({
                        channelId: bigInt(channelId),
                        accessHash: bigInt(accessHash)
                    }),
                    title
                })
            );
            await client.destroy();
        } catch (err) {
            await client.destroy();
            throw err;
        }
    }

    static findAdminAndUpdateAdminRights = async (
        payload: any,
        adminCheck?: boolean
    ) => {
        // const client =
        //     actualClient || (await this.createTelegramSession(session));
        // let botToken = '5515533637:AAFYNv5V2sauTkvyM8OjB- botToken.botToken.tokenXrWUoc6uS8Rnk';
        const botToken = await groupBotRepository.findOne({
            groupId: payload.groupId,
            isActive: 1,
            isPrimary: 1
        });
        console.log('Admin Console', payload, botToken);
        // const mobile = payload.mobile;
        // const id = payload.id;
        try {
            const {
                telegramUserId,
                // telegramAccessHash,
                channelId,
                // channelHash,
                mobile,
                id,
                inviteLink,
                updatedAt
            } = payload; // session, channelId, channelHash,
            console.log('A-2', payload, updatedAt);
            console.log('B-2', mobile, id);

            // bot token admin right flow

            let result = await this.getParticipantViaBot(
                botToken.botToken.token,
                channelId,
                telegramUserId
            );
            // if (!result) {
            //     await this.sleep(500);
            //     console.log('waiting to get participant again');
            //     result = await this.getParticipantViaBot(
            //         botToken.botToken.token,
            //         channelId,
            //         telegramUserId
            //     );
            // }

            //

            // const result = await client.invoke(
            //     new Api.channels.GetParticipant({
            //         channel: new Api.InputChannel({
            //             channelId: bigInt(channelId),
            //             accessHash: bigInt(channelHash)
            //         }),
            //         participant: new Api.InputUser({
            //             userId: bigInt(telegramUserId),
            //             accessHash: bigInt(telegramAccessHash)
            //         })
            //     })
            // ); // prints the result

            // TODO: updatedAt replace with better close one

            const differenceInTime = new Date().getTime() - updatedAt.getTime();

            const differenceInDays = differenceInTime / (1000 * 3600 * 24);

            console.log('differenceInDays', differenceInDays);

            // const result = await client.invoke(
            //     new Api.channels.GetParticipant({
            //         channel: new Api.InputChannel({
            //             channelId: bigInt(channelId),
            //             accessHash: bigInt(channelHash)
            //         }),
            //         participant: new Api.InputUser({
            //             userId: bigInt(telegramUserId),
            //             accessHash: bigInt(telegramAccessHash)
            //         })
            //     })
            // ); // prints the result
            if (!result || !result.data || !result.data['result']) {
                console.log('ASDFGH');
                return false;
            }

            console.log('STATUS of user', result.data['result'].status);

            if (adminCheck && result.data['result'].status == 'administrator') {
                console.log('Already admin');
                // return true;
            }

            if (adminCheck && result.data['result'].status !== 'member') {
                return false;
                // return true;
            }

            // user not joined

            if (!adminCheck && result.data['result'].status == 'left') {
                console.log('User not joined');
                if (differenceInDays >= 1) {
                    // const revokeLink = await client.invoke(
                    //     new Api.messages.EditExportedChatInvite({
                    //         peer: new Api.InputChannel({
                    //             channelId: bigInt(channelId),
                    //             accessHash: bigInt(channelHash)
                    //         }),
                    //         link: inviteLink,
                    //         revoked: true,
                    //         requestNeeded: true
                    //     })
                    // );

                    console.log(
                        'Main chala',
                        botToken.botToken.token,
                        inviteLink,
                        channelId
                    );

                    !adminCheck &&
                        (await this.revokeLinkViaBot(
                            botToken.botToken.token,
                            inviteLink,
                            channelId
                        ));
                    !adminCheck &&
                        (await memberGroupMap.updateGroupMemberStatus(
                            {
                                groupId: payload.groupId,
                                memberId: payload.memberId
                            },
                            'failed'
                        ));
                }
                return false;
                // return true;
            }

            await this.sleep(1000);

            const adminRes = adminCheck
                ? await this.editAdminRightsViaBot(
                      telegramUserId,
                      channelId,
                      botToken.botToken.token
                  )
                : undefined;
            console.log('EDIT_ADMIN_RIGHTS :: ', adminRes);

            !adminCheck &&
                (await this.revokeLinkViaBot(
                    botToken.botToken.token,
                    inviteLink,
                    channelId
                ));

            // if (!actualClient) {
            //     await client.destroy();
            // }
            // console.log('result :: ', result);
            return adminCheck ? adminRes : true;
        } catch (err) {
            sendNotificationToGoogleChat(CHAT_URL, {
                source: `EDIT ADMIN, BOT-${botToken.botToken.id}`,
                context: {
                    action: 'EDIT_ADMIN',
                    payload: JSON.stringify(payload)
                },

                error: JSON.stringify(err)
            });
            console.log('telegram member check  error', err);
            // not needed as userId does not changes in telegram
            // if (err.errorMessage === 'PARTICIPANT_ID_INVALID') {
            //     await this.checkAndUpdateUser(
            //         {
            //             mobile,
            //             id
            //         },
            //         client
            //     );
            //     return false;
            // }
            // await client.destroy();
            return false;
        }
    };

    static async createInviteLinks(
        payload: any,
        session: any,
        client: any,
        limit: number,
        links: any
    ) {
        const acualclient =
            client || (await this.createTelegramSession(session));
        try {
            for (let i = 0; i < limit; i += 1) {
                try {
                    const invite = await acualclient.invoke(
                        new Api.messages.ExportChatInvite({
                            peer: new Api.InputPeerChannel({
                                channelId: payload.channelId,
                                accessHash: payload.channelHash
                            }),
                            usageLimit: 1
                        })
                    );
                    console.log('INVITE LINK CREATED ::: ', invite['link']);
                    // if (!client) {
                    //     await acualclient.destroy();
                    // }
                    links.push(invite['link']);
                } catch (err) {
                    console.log('Error inside', err.message);
                }
            }

            if (!client) {
                await acualclient.destroy();
            }
        } catch (err) {
            if (!client) {
                await acualclient.destroy();
            }
            console.log('invite links creation error', err);
        }
    }

    static async revokeLinkViaBot(
        token: string,
        link: string,
        channelId: number
    ) {
        let headersList = {
            'Content-Type': 'application/json'
        };
        try {
            const data1 = await axios.post(
                `https://api.telegram.org/bot${token}/revokeChatInviteLink?chat_id=-100${channelId}&invite_link=${link}`,
                {
                    headers: headersList
                }
            );
            console.log('REVOKED INVITE LINK :: :: ', data1.data);
        } catch (err) {
            console.log('error in revoke link', err);
            sendNotificationToGoogleChat(CHAT_URL, {
                source: err.config.url,
                context: { action: 'EXPIRE_LINK' },
                error: err.response.data
            });
        }
    }

    static async getParticipantViaBot(botToken, channelId, telegramUserId) {
        try {
            let headersList = {
                Accept: '*/*'
            };

            // let reqOptions = {
            //     url: `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=-100${channelId}&user_id=${telegramUserId}`,
            //     method: 'POST',
            //     headers: headersList
            // };

            console.log(
                `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=-100${channelId}&user_id=${telegramUserId}`
            );

            const result = await axios.get(
                `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=-100${channelId}&user_id=${telegramUserId}`,
                { headers: headersList }
            );
            return result;
        } catch (err) {
            sendNotificationToGoogleChat(CHAT_URL, {
                source: err.config.url,
                context: { action: 'GET_PARTICIPANT' },
                error: err.response.data
            });
            console.log('get participant error', err.message);
            return false;
        }
    }

    static async banChatMemberViaBot(
        userId: string,
        chatId: string,
        botToken: string
    ) {
        try {
            const headersList = {
                Accept: '*/*',
                'Content-Type': 'application/json'
            };

            const banBodyContent = {
                chat_id: parseInt('-100' + chatId),
                user_id: userId
            };
            const banReqOptions = {
                url: `https://api.telegram.org/bot${botToken}/banChatMember`,
                method: 'POST',
                headers: headersList,
                data: banBodyContent
            };
            const banResult = await axios.request(banReqOptions);

            console.log('Banned user successfully');
            return banResult && banResult.data;
        } catch (error) {
            console.log('error in banMember form Telegram', error);
        }
    }

    static async unbanChatMemberViaBot(
        userId: string,
        chatId: string,
        botToken: string
    ) {
        try {
            const headersList = {
                Accept: '*/*',
                'Content-Type': 'application/json'
            };
            let unBanBodyContent = {
                chat_id: parseInt('-100' + chatId),
                user_id: userId,
                only_if_banned: true
            };

            let unbanReqOptions = {
                url: `https://api.telegram.org/bot${botToken}/unbanChatMember`,
                method: 'POST',
                headers: headersList,
                data: unBanBodyContent
            };
            const unBanResult = await axios.request(unbanReqOptions);

            console.log('unBanned user successfully');
            return unBanResult && unBanResult.data;
        } catch (error) {
            console.log('error in unban user from telegram', error);
        }
    }

    static async sleep(seconds: number) {
        return new Promise((resolve) => setTimeout(resolve, seconds));
    }
}
