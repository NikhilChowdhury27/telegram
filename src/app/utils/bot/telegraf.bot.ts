import { Telegraf } from 'telegraf';
import telegram from '../telegram/telegram.common';

import memberService from '../../api/members/services/member.service';
import groupService from '../../api/groups/services/group';
import RedisManager from '../../../config/conf/RedisCache';
import { launchBots } from '../../../server';
import groupRepository from '../../../app/repository/group.repository';
import { IGroup } from '../../../app/api/groups/group.interface';
import GroupBotMap from '../../../models/groupBotMap';
import BotToken from '../../../models/BotToken';

let axios = require('axios').default;
import GroupCoAdminMapping from '../../../models/Group_CoAdmin_details';

// const token1 = '5472401334:AAEWZYy3AzeSG5TZClgy7VLerF0LdMfb2CU'; // stage
// const token1 = '5515533637:AAFYNv5V2sauTkvyM8OjB-XrWUoc6uS8Rnk'; // dev-amir1
// const token1 = '5615963331:AAFySaBVah8bx7AWZ5C7ZfbQIk4xFrKwiic'; // dev-amirm-an-bot1-anonymous-prod
// const token1 = '5749470372:AAEC2SEqmoIawLGnoiNKiyWk9zMDMaJN4IA'; // dev-amirm-an-bot4-anonymous-stage
// const token2 = '5222623004:AAH-6YB4EQQ8lZnebmatrZQG4O4Gqa6PE0w'; // stage
// const token2 = '5454646480:AAFUYxS9-sj29y7PUndkLdEn5aiguaIQda0'; // dev-amir2
// const token2 = '5739058981:AAFI7cz0T5L55oOPAxVNkwAUx2S_fkDVikY'; // dev-amirm-an-bot2-anonymous-prod
// const token2 = '5631071583:AAHskBdY-f5is2egEc4TADCJ8WdpMtlQKVo'; // dev-amirm-an-bot5-anonymous-stage
// const token3 = '5421778576:AAF0bg2oIr6YftEPUi1cw7B7miPRPK2uVQA'; // stage
// const token3 = '5320845874:AAFHTlfo74CcccfiAaiHx_S-d4yF7LZfn2g'; // dev-amirn1
// const token3 = '5244659924:AAGZxGHLpJ1rooGKErWaCqViejFS9W0VXmc'; // dev-amirm-an-bot3-anonymous-prod
// const token3 = '5501952110:AAH9NAaPA_ZvEJVEJsy_AZ6HFHN6-PpqN50'; // dev-amirm-an-bot3-anonymous-stage

const token1 = process.env.BOT_LISTENER_TOKEN_1;
const token2 = process.env.BOT_LISTENER_TOKEN_2;
const token3 = process.env.BOT_LISTENER_TOKEN_3;

const token4 = process.env.BOT_LISTENER_TOKEN_4;
// const token5 = process.env.BOT_LISTENER_TOKEN_2;
// const token6 = process.env.BOT_LISTENER_TOKEN_3;

const bot1 = new Telegraf(token1);
const bot2 = new Telegraf(token2);
const bot3 = new Telegraf(token3);

const automateBot1 = new Telegraf(token4);
// const automateBot2 = new Telegraf(token5);
// const automateBot3 = new Telegraf(token6);

console.log(bot1);
console.log(bot2);
console.log(bot3);

bot1.on('chat_member', async (ctx) => {
    try {
        console.log('bot1', ctx.chatMember);
        const chatId = ctx.chatMember.chat.id;
        if (ctx.chatMember.new_chat_member.status == 'left') {
            const chatId = ctx.chatMember.chat.id;

            const kickedUser = await RedisManager.getCount(
                `${chatId}-${ctx.chatMember.old_chat_member.user.id}`
            );
            if (kickedUser) {
                RedisManager.expireKey(
                    `${chatId}-${ctx.chatMember.old_chat_member.user.id}`,
                    10
                );
                return;
            }

            const member = await memberService.findMember({
                channelId: parseInt(String(chatId).slice(4)),
                joinedBy: ctx.chatMember.new_chat_member.user.id
            });

            console.log(member);

            member &&
                memberService.updateJoiningInfo(
                    member.memberId,
                    member.groupId,
                    {
                        isLeft: 1,
                        inviteLink: null
                    }
                );

            return;
        }

        if (!ctx.chatMember.invite_link) {
            return;
        }
        const link = ctx.chatMember.invite_link.invite_link;
        console.log('going to expire invite link');
        const tempLink = link.split('...')[0];
        console.log('temp', tempLink);

        // get by pattern

        const patternSearch = await RedisManager.searchKeys(
            '*' + tempLink + '*'
        );
        console.log('PATTERN-', patternSearch);
        let actualLink = patternSearch[0] || tempLink;
        console.log('ACTUAL-', actualLink);
        const data = await RedisManager.getFromHashmap(actualLink);
        const revoked: any = data.token
            ? await telegram.revokeLinkViaBot(
                  data.token,
                  actualLink,
                  parseInt(String(chatId).slice(4))
              )
            : undefined;

        console.log('invite link succesfully expired', revoked);

        console.log(data);
        if (data.type === 'group') {
            // TODO: send in pubsub
            // group operation to make admin

            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );

            admin &&
                groupService.updateGroupAndNotify(
                    data.userId,
                    data.mobile,
                    data.groupId,
                    data.name,
                    data.groupName,
                    ctx.chatMember.new_chat_member.user.id
                );

            // store necessary info of user
            // userId, status=success in group table, send sms

            // delete key
            await RedisManager.delMember(link);
            if (admin) {
                console.log('admin confirmed');
            }
        } else if (data.type === 'coAdmin') {
            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );
            console.log('Made co Admin', admin);

            await GroupCoAdminMapping.update(
                {
                    joinedBy: ctx.chatMember.new_chat_member.user.id
                },
                {
                    where: {
                        groupId: data.groupId,
                        mobile: data.mobile
                    }
                }
            );
            await RedisManager.delMember(link);
        } else {
            if (!data.type) {
                const member = await memberService.getInviteLink(actualLink);
                console.log('MEMBER-', member);
                if (!member) {
                    return;
                }
                data.userId = member.memberId;
                data.groupId = member.groupId;
                data.token = member.token;
                actualLink = member.inviteLink;
                data.currentPlan = member.currentPlan;
                data.status = member.status;
                data['planId'] = member.planId;
            }
            data['planId'] = data.planId ? Number(data.planId) : null;
            console.log('PLANID', data.planId);

            console.log('final data in event', data);
            const expiryInfo = await memberService.calculateExpiry(
                data.userId,
                data.groupId,
                new Date(ctx.chatMember.date * 1000),
                data.currentPlan != '' ? JSON.parse(data.currentPlan) : '',
                data.status,
                data.planId
            );
            const updatedData = {
                joinedBy: ctx.chatMember.new_chat_member.user.id,
                joinedDate: new Date(ctx.chatMember.date * 1000),
                isLeft: 0,
                isActive: 1,
                status: 'success'
            };
            if (expiryInfo) {
                updatedData['expiryDate'] = expiryInfo.expiryDate;
                updatedData['expiryTimestamp'] = expiryInfo.expiryTimestamp;
            }

            console.log('expiry data', expiryInfo);
            memberService.updateJoiningInfo(
                data.userId,
                data.groupId,
                updatedData
            );
            if (!revoked) {
                await telegram.revokeLinkViaBot(
                    data.token,
                    actualLink,
                    parseInt(String(chatId).slice(4))
                );
            }
        }
    } catch (err) {
        console.log(err.message);
    }
});

bot2.on('chat_member', async (ctx) => {
    try {
        console.log('bot2', ctx.chatMember);
        const chatId = ctx.chatMember.chat.id;
        if (ctx.chatMember.new_chat_member.status == 'left') {
            const chatId = ctx.chatMember.chat.id;

            const kickedUser = await RedisManager.getCount(
                `${chatId}-${ctx.chatMember.old_chat_member.user.id}`
            );
            if (kickedUser) {
                RedisManager.expireKey(
                    `${chatId}-${ctx.chatMember.old_chat_member.user.id}`,
                    10
                );
                return;
            }

            const member = await memberService.findMember({
                channelId: parseInt(String(chatId).slice(4)),
                joinedBy: ctx.chatMember.new_chat_member.user.id
            });

            console.log(member);

            member &&
                memberService.updateJoiningInfo(
                    member.memberId,
                    member.groupId,
                    {
                        isLeft: 1,
                        inviteLink: null
                    }
                );

            return;
        }
        if (!ctx.chatMember.invite_link) {
            return;
        }
        const link = ctx.chatMember.invite_link.invite_link;
        console.log('going to expire invite link');
        const tempLink = link.split('...')[0];
        console.log('temp', tempLink);

        // get by pattern

        const patternSearch = await RedisManager.searchKeys(
            '*' + tempLink + '*'
        );
        console.log('PATTERN-', patternSearch);
        let actualLink = patternSearch[0] || tempLink;
        console.log('ACTUAL-', actualLink);
        const data = await RedisManager.getFromHashmap(actualLink);
        const revoked: any = data.token
            ? await telegram.revokeLinkViaBot(
                  data.token,
                  actualLink,
                  parseInt(String(chatId).slice(4))
              )
            : undefined;

        console.log('invite link succesfully expired', revoked);

        console.log(data);
        if (data.type === 'group') {
            // TODO: send in pubsub
            // group operation to make admin

            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );

            admin &&
                groupService.updateGroupAndNotify(
                    data.userId,
                    data.mobile,
                    data.groupId,
                    data.name,
                    data.groupName,
                    ctx.chatMember.new_chat_member.user.id
                );

            // store necessary info of user
            // userId, status=success in group table, send sms

            // delete key
            await RedisManager.delMember(link);
            if (admin) {
                console.log('admin confirmed');
            }
        } else if (data.type === 'coAdmin') {
            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );
            console.log('Made co Admin', admin);

            await GroupCoAdminMapping.update(
                {
                    joinedBy: ctx.chatMember.new_chat_member.user.id
                },
                {
                    where: {
                        groupId: data.groupId,
                        mobile: data.mobile
                    }
                }
            );
            await RedisManager.delMember(link);
        } else {
            if (!data.type) {
                const member = await memberService.getInviteLink(actualLink);
                console.log('MEMBER-', member);
                if (!member) {
                    return;
                }

                data.userId = member.memberId;
                data.groupId = member.groupId;
                data.token = member.token;
                data.status = member.status;
                actualLink = member.inviteLink;

                data.currentPlan = member.currentPlan;
                data['planId'] = member.planId;
            }
            data['planId'] = data.planId ? Number(data.planId) : null;
            console.log('PLANID', data.planId);
            console.log('final data in event', data);
            const expiryInfo = await memberService.calculateExpiry(
                data.userId,
                data.groupId,
                new Date(ctx.chatMember.date * 1000),
                data.currentPlan != '' ? JSON.parse(data.currentPlan) : '',
                data.status,
                data.planId
            );
            console.log('expiry data', expiryInfo);
            const updatedData = {
                joinedBy: ctx.chatMember.new_chat_member.user.id,
                joinedDate: new Date(ctx.chatMember.date * 1000),
                isLeft: 0,
                isActive: 1,
                status: 'success'
            };
            if (expiryInfo) {
                updatedData['expiryDate'] = expiryInfo.expiryDate;
                updatedData['expiryTimestamp'] = expiryInfo.expiryTimestamp;
            }

            memberService.updateJoiningInfo(
                data.userId,
                data.groupId,
                updatedData
            );
            if (!revoked) {
                await telegram.revokeLinkViaBot(
                    data.token,
                    actualLink,
                    parseInt(String(chatId).slice(4))
                );
            }
        }
    } catch (err) {
        console.log(err.message);
    }
});

bot3.on('chat_member', async (ctx) => {
    try {
        console.log('bot3', ctx.chatMember);
        const chatId = ctx.chatMember.chat.id;
        if (ctx.chatMember.new_chat_member.status == 'left') {
            const chatId = ctx.chatMember.chat.id;

            const kickedUser = await RedisManager.getCount(
                `${chatId}-${ctx.chatMember.old_chat_member.user.id}`
            );
            if (kickedUser) {
                RedisManager.expireKey(
                    `${chatId}-${ctx.chatMember.old_chat_member.user.id}`,
                    10
                );
                return;
            }

            const member = await memberService.findMember({
                channelId: parseInt(String(chatId).slice(4)),
                joinedBy: ctx.chatMember.new_chat_member.user.id
            });

            console.log(member);

            member &&
                memberService.updateJoiningInfo(
                    member.memberId,
                    member.groupId,
                    {
                        isLeft: 1,
                        inviteLink: null
                    }
                );

            return;
        }
        if (!ctx.chatMember.invite_link) {
            return;
        }
        const link = ctx.chatMember.invite_link.invite_link;
        console.log('going to expire invite link');
        const tempLink = link.split('...')[0];
        console.log('temp', tempLink);

        // get by pattern

        const patternSearch = await RedisManager.searchKeys(
            '*' + tempLink + '*'
        );
        console.log('PATTERN-', patternSearch);
        let actualLink = patternSearch[0] || tempLink;
        console.log('ACTUAL-', actualLink);
        const data = await RedisManager.getFromHashmap(actualLink);
        const revoked: any = data.token
            ? await telegram.revokeLinkViaBot(
                  data.token,
                  actualLink,
                  parseInt(String(chatId).slice(4))
              )
            : undefined;

        console.log('invite link succesfully expired', revoked);

        console.log(data);
        if (data.type === 'group') {
            // TODO: send in pubsub
            // group operation to make admin

            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );

            admin &&
                groupService.updateGroupAndNotify(
                    data.userId,
                    data.mobile,
                    data.groupId,
                    data.name,
                    data.groupName,
                    ctx.chatMember.new_chat_member.user.id
                );

            // store necessary info of user
            // userId, status=success in group table, send sms

            // delete key
            await RedisManager.delMember(link);
            if (admin) {
                console.log('admin confirmed');
            }
        } else if (data.type === 'coAdmin') {
            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );
            console.log('Made co Admin', admin);

            await GroupCoAdminMapping.update(
                {
                    joinedBy: ctx.chatMember.new_chat_member.user.id
                },
                {
                    where: {
                        groupId: data.groupId,
                        mobile: data.mobile
                    }
                }
            );
            await RedisManager.delMember(link);
        } else {
            if (!data.type) {
                const member = await memberService.getInviteLink(actualLink);
                console.log('MEMBER-', member);
                if (!member) {
                    return;
                }

                data.userId = member.memberId;
                data.groupId = member.groupId;
                data.token = member.token;
                actualLink = member.inviteLink;
                data.currentPlan = member.currentPlan;
                data.status = member.status;
                data['planId'] = member.currentPlan;
            }
            data['planId'] = data.planId ? Number(data.planId) : null;
            console.log('PLANID', data.planId);
            console.log('final data in event', data);
            const expiryInfo = await memberService.calculateExpiry(
                data.userId,
                data.groupId,
                new Date(ctx.chatMember.date * 1000),
                data.currentPlan != '' ? JSON.parse(data.currentPlan) : '',
                data.status,
                data.planId
            );
            console.log('expiry data', expiryInfo);
            const updatedData = {
                joinedBy: ctx.chatMember.new_chat_member.user.id,
                joinedDate: new Date(ctx.chatMember.date * 1000),
                isLeft: 0,
                isActive: 1,
                status: 'success'
            };
            if (expiryInfo) {
                updatedData['expiryDate'] = expiryInfo.expiryDate;
                updatedData['expiryTimestamp'] = expiryInfo.expiryTimestamp;
            }

            memberService.updateJoiningInfo(
                data.userId,
                data.groupId,
                updatedData
            );
            if (!revoked) {
                await telegram.revokeLinkViaBot(
                    data.token,
                    actualLink,
                    parseInt(String(chatId).slice(4))
                );
            }
        }
    } catch (err) {
        console.log(err.message);
    }
});

automateBot1.start((ctx) => {
    console.log(ctx.from.id, ctx.from.first_name, ctx.botInfo);
    ctx.reply(
        `Welcome ${ctx.from.first_name} \n\nThank you for choosing fankonnect bot to automate your Telegram Channel. \n\nTo gert started, add this bot fankonnect_bot bot as an admin in your existing channel. \n\nWe are waiting for you, Cheers!`
    );

    ctx.reply(`https://youtu.be/hXwclR1DXIg`);
});

automateBot1.on('my_chat_member', async (ctx) => {
    // db call here
    // if not already exists the channel id then create
    try {
        if (ctx.myChatMember.chat.type != 'channel') {
            if (ctx.myChatMember.new_chat_member.status != 'member') {
                return;
            }
            let options = {
                method: 'POST',
                url: `https://api.telegram.org/bot${token4}/sendMessage`,
                data: {
                    chat_id: ctx.from.id,
                    text: `${ctx.myChatMember.chat['title']} is not a Private Channel. \n\nPlease add the bot in a Private Channel to proceed with the automation, Thanks`
                },
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                }
            };

            axios
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.error(error);
                });

            return;
        }

        if (ctx.myChatMember.new_chat_member.status !== 'administrator') {
            return;
        }
        const channelId = String(ctx.chat.id).slice(4);
        const groupName = ctx.chat['title'];
        const botId = ctx.myChatMember.new_chat_member.user.id;
        console.log(
            channelId,
            groupName,
            botId,
            ctx.myChatMember.new_chat_member.status
        );

        let options = {
            method: 'GET',
            url: `https://api.telegram.org/bot${token4}/getChat`,
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json'
            },
            data: {
                chat_id: String(ctx.chat.id)
            }
        };

        try {
            const getchannel = await axios.request(options);
            console.log('GET_CHANNEL', getchannel.data);
            if (!getchannel.data || getchannel.data.error_code == 403) {
                let options = {
                    method: 'POST',
                    url: `https://api.telegram.org/bot${token4}/sendMessage`,
                    data: {
                        chat_id: ctx.from.id,
                        text: `Ooops! \n\n There was some issue while adding our bot to the channel ${ctx.myChatMember.chat['title']}. \n\n Please remove the bot first if already added and add again to continue with the automation. \n\n Thanks`
                    },
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json'
                    }
                };

                axios
                    .request(options)
                    .then(function (response) {
                        console.log(response.data);
                    })
                    .catch(function (error) {
                        console.error(error);
                    });

                return;
            }
        } catch (err) {
            let options = {
                method: 'POST',
                url: `https://api.telegram.org/bot${token4}/sendMessage`,
                data: {
                    chat_id: ctx.from.id,
                    text: `Ooops! \n\n There was some issue while adding our bot to the channel ${ctx.myChatMember.chat['title']}. \n\n Please remove the bot first if already added and add again to continue with the automation. \n\n Thanks`
                },
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                }
            };

            axios
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.error(error);
                });

            return;
        }

        try {
            const group: IGroup = {
                about: 'sample',
                channelId: Number(channelId),
                groupName,
                category: 'Sample',
                channelHash: '',
                inviteLink: '',
                createdBy: 307,
                subscriptionPlan: '{}',
                status: 'success',
                removalBotStatus: true,
                type: 'telegramExisting'
            };
            const existing = await groupRepository.findGroup({
                channelId: Number(channelId)
            });
            if (existing) {
                console.log('channel existin');
                return;
            }

            const result = await groupRepository.addGroup(group);
            const bot = await BotToken.findOne({
                where: {
                    token: token4
                }
            });
            let bulkPayload = [];
            for (let i = 0; i <= 2; i++) {
                bulkPayload.push({
                    groupId: result.id,
                    botTokenId: bot.id,
                    isActive: 1,
                    isPrimary: i,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            await GroupBotMap.bulkCreate(bulkPayload);

            let str =
                '𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐬𝐮𝐫𝐞 𝐭𝐡𝐚𝐭 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐢𝐬 𝐚𝐝𝐝𝐞𝐝 𝐚𝐬 𝐚𝐧 𝐀𝐝𝐦𝐢𝐧 𝐰𝐢𝐭𝐡 𝐚𝐥𝐥 𝐭𝐡𝐞 𝐫𝐢𝐠𝐡𝐭𝐬 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐨𝐧 𝐭𝐨 𝐰𝐨𝐫𝐤';

            let options = {
                method: 'POST',
                url: `https://api.telegram.org/bot${token4}/sendMessage`,
                data: {
                    chat_id: ctx.from.id,
                    text: `Congrats ${ctx.from.first_name}! 👍 \n\nIt's almost done. \n\nNow you can fill in subscription details on Fankonnect app for your channel ${groupName}. \n\n${str}. \n\nContact us in case case you have any queries. \n\nsupport@fankonnect.com \n\nClick below button to open in fankonnect app.`,
                    parse_mode: 'markdown',

                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '    Open Fankonnect App     ',
                                    url:
                                        'https://in-app.fankonnect.com/app/telegram-channel/' +
                                        channelId
                                }
                            ]
                        ]
                    },

                    disable_web_page_preview: true
                },
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                }
            };

            axios
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.error(error);
                });
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        console.log(err);
    }

    // console.log(ctx.update.my_chat_member.chat, ctx.update.my_chat_member);
});

automateBot1.on('chat_member', async (ctx) => {
    try {
        console.log('bot3', ctx.chatMember);
        const chatId = ctx.chatMember.chat.id;
        if (ctx.chatMember.new_chat_member.status == 'left') {
            const chatId = ctx.chatMember.chat.id;

            const kickedUser = await RedisManager.getCount(
                `${chatId}-${ctx.chatMember.old_chat_member.user.id}`
            );
            if (kickedUser) {
                RedisManager.expireKey(
                    `${chatId}-${ctx.chatMember.old_chat_member.user.id}`,
                    10
                );
                return;
            }

            const member = await memberService.findMember({
                channelId: parseInt(String(chatId).slice(4)),
                joinedBy: ctx.chatMember.new_chat_member.user.id
            });

            console.log(member);

            member &&
                memberService.updateJoiningInfo(
                    member.memberId,
                    member.groupId,
                    {
                        isLeft: 1,
                        inviteLink: null
                    }
                );

            return;
        }
        if (!ctx.chatMember.invite_link) {
            return;
        }
        const link = ctx.chatMember.invite_link.invite_link;
        console.log('going to expire invite link');
        const tempLink = link.split('...')[0];
        console.log('temp', tempLink);

        // get by pattern

        const patternSearch = await RedisManager.searchKeys(
            '*' + tempLink + '*'
        );
        console.log('PATTERN-', patternSearch);
        let actualLink = patternSearch[0] || tempLink;
        console.log('ACTUAL-', actualLink);
        const data = await RedisManager.getFromHashmap(actualLink);
        const revoked: any = data.token
            ? await telegram.revokeLinkViaBot(
                  data.token,
                  actualLink,
                  parseInt(String(chatId).slice(4))
              )
            : undefined;

        console.log('invite link succesfully expired', revoked);

        console.log(data);
        if (data.type === 'group') {
            // TODO: send in pubsub
            // group operation to make admin

            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );

            admin &&
                groupService.updateGroupAndNotify(
                    data.userId,
                    data.mobile,
                    data.groupId,
                    data.name,
                    data.groupName,
                    ctx.chatMember.new_chat_member.user.id
                );

            // store necessary info of user
            // userId, status=success in group table, send sms

            // delete key
            await RedisManager.delMember(link);
            if (admin) {
                console.log('admin confirmed');
            }
        } else if (data.type === 'coAdmin') {
            const admin = await telegram.editAdminRightsViaBot(
                ctx.chatMember.new_chat_member.user.id,
                chatId,
                data.token,
                Number(data.conditionalApproval)
            );
            console.log('Made co Admin', admin);

            await GroupCoAdminMapping.update(
                {
                    joinedBy: ctx.chatMember.new_chat_member.user.id
                },
                {
                    where: {
                        groupId: data.groupId,
                        mobile: data.mobile
                    }
                }
            );
            await RedisManager.delMember(link);
        } else {
            if (!data.type) {
                const member = await memberService.getInviteLink(actualLink);
                console.log('MEMBER-', member);
                if (!member) {
                    return;
                }

                data.userId = member.memberId;
                data.groupId = member.groupId;
                data.token = member.token;
                actualLink = member.inviteLink;
                data.currentPlan = member.currentPlan;
                data.status = member.status;
                data['planId'] = member.currentPlan;
            }
            data['planId'] = data.planId ? Number(data.planId) : null;
            console.log('PLANID', data.planId);
            console.log('final data in event', data);
            const expiryInfo = await memberService.calculateExpiry(
                data.userId,
                data.groupId,
                new Date(ctx.chatMember.date * 1000),
                data.currentPlan != '' ? JSON.parse(data.currentPlan) : '',
                data.status,
                data.planId
            );
            console.log('expiry data', expiryInfo);
            const updatedData = {
                joinedBy: ctx.chatMember.new_chat_member.user.id,
                joinedDate: new Date(ctx.chatMember.date * 1000),
                isLeft: 0,
                isActive: 1,
                status: 'success'
            };
            if (expiryInfo) {
                updatedData['expiryDate'] = expiryInfo.expiryDate;
                updatedData['expiryTimestamp'] = expiryInfo.expiryTimestamp;
            }

            memberService.updateJoiningInfo(
                data.userId,
                data.groupId,
                updatedData
            );
            if (!revoked) {
                await telegram.revokeLinkViaBot(
                    data.token,
                    actualLink,
                    parseInt(String(chatId).slice(4))
                );
            }
        }
    } catch (err) {
        console.log(err.message);
    }
});
bot1.on('chat_join_request', async (ctx) => {
    console.log(ctx.chatJoinRequest);

    // fetch member by link
    const link = ctx.chatJoinRequest.invite_link.invite_link;
    console.log('chat join request');
    const tempLink = link.split('...')[0];
    console.log('temp', tempLink);

    // get by pattern

    const patternSearch = await RedisManager.searchKeys('*' + tempLink + '*');
    console.log('PATTERN-', patternSearch);
    let actualLink = patternSearch[0] || tempLink;
    console.log('ACTUAL-', actualLink);
    const data = await RedisManager.getFromHashmap(actualLink);
    if (!data.type) {
        const member = await memberService.getInviteLink(actualLink);
        console.log('MEMBER-', member);
        if (!member) {
            return;
        }

        data.userId = member.memberId;
        data.groupId = member.groupId;
        data.token = member.token;
        actualLink = member.inviteLink;
    }

    const updatedData = {
        joinedBy: ctx.chatJoinRequest.from.id,
        status: 'requested'
    };

    memberService.updateJoiningInfo(data.userId, data.groupId, updatedData);

    await telegram.revokeLinkViaBot(
        data.token,
        actualLink,
        parseInt(String(ctx.chatJoinRequest.chat.id).slice(4))
    );

    // mark as requested
});

bot2.on('chat_join_request', async (ctx) => {
    console.log(ctx.chatJoinRequest);

    // fetch member by link
    const link = ctx.chatJoinRequest.invite_link.invite_link;
    console.log('chat join request');
    const tempLink = link.split('...')[0];
    console.log('temp', tempLink);

    // get by pattern

    const patternSearch = await RedisManager.searchKeys('*' + tempLink + '*');
    console.log('PATTERN-', patternSearch);
    let actualLink = patternSearch[0] || tempLink;
    console.log('ACTUAL-', actualLink);
    const data = await RedisManager.getFromHashmap(actualLink);
    if (!data.type) {
        const member = await memberService.getInviteLink(actualLink);
        console.log('MEMBER-', member);
        if (!member) {
            return;
        }

        data.userId = member.memberId;
        data.groupId = member.groupId;
        data.token = member.token;
        actualLink = member.inviteLink;
    }

    const updatedData = {
        joinedBy: ctx.chatJoinRequest.from.id,
        status: 'requested'
    };

    memberService.updateJoiningInfo(data.userId, data.groupId, updatedData);

    await telegram.revokeLinkViaBot(
        data.token,
        actualLink,
        parseInt(String(ctx.chatJoinRequest.chat.id).slice(4))
    );

    // mark as requested
});

bot3.on('chat_join_request', async (ctx) => {
    console.log(ctx.chatJoinRequest);

    // fetch member by link
    const link = ctx.chatJoinRequest.invite_link.invite_link;
    console.log('chat join request');
    const tempLink = link.split('...')[0];
    console.log('temp', tempLink);

    // get by pattern

    const patternSearch = await RedisManager.searchKeys('*' + tempLink + '*');
    console.log('PATTERN-', patternSearch);
    let actualLink = patternSearch[0] || tempLink;
    console.log('ACTUAL-', actualLink);
    const data = await RedisManager.getFromHashmap(actualLink);
    if (!data.type) {
        const member = await memberService.getInviteLink(actualLink);
        console.log('MEMBER-', member);
        if (!member) {
            return;
        }

        data.userId = member.memberId;
        data.groupId = member.groupId;
        data.token = member.token;
        actualLink = member.inviteLink;
    }

    const updatedData = {
        joinedBy: ctx.chatJoinRequest.from.id,
        status: 'requested'
    };

    memberService.updateJoiningInfo(data.userId, data.groupId, updatedData);

    await telegram.revokeLinkViaBot(
        data.token,
        actualLink,
        parseInt(String(ctx.chatJoinRequest.chat.id).slice(4))
    );

    // mark as requested
});

automateBot1.on('chat_join_request', async (ctx) => {
    console.log(ctx.chatJoinRequest);

    // fetch member by link
    const link = ctx.chatJoinRequest.invite_link.invite_link;
    console.log('chat join request');
    const tempLink = link.split('...')[0];
    console.log('temp', tempLink);

    // get by pattern

    const patternSearch = await RedisManager.searchKeys('*' + tempLink + '*');
    console.log('PATTERN-', patternSearch);
    let actualLink = patternSearch[0] || tempLink;
    console.log('ACTUAL-', actualLink);
    const data = await RedisManager.getFromHashmap(actualLink);
    if (!data.type) {
        const member = await memberService.getInviteLink(actualLink);
        console.log('MEMBER-', member);
        if (!member) {
            return;
        }

        data.userId = member.memberId;
        data.groupId = member.groupId;
        data.token = member.token;
        actualLink = member.inviteLink;
    }

    const updatedData = {
        joinedBy: ctx.chatJoinRequest.from.id,
        status: 'requested'
    };

    memberService.updateJoiningInfo(data.userId, data.groupId, updatedData);

    await telegram.revokeLinkViaBot(
        data.token,
        actualLink,
        parseInt(String(ctx.chatJoinRequest.chat.id).slice(4))
    );

    // mark as requested
});

// bot1.launch({ allowedUpdates: ['chat_member'] })
//     .then(() => {
//         console.log('Bot Running');
//     })
//     .catch((err) => {
//         console.log(`Error Running Bot: ${err}`);
//     });

// Enable graceful stop
process.once('SIGINT', () => {
    console.log('stopping');
    bot1.stop('SIGINT');
    bot2.stop('SIGINT');
    bot3.stop('SIGINT');
    automateBot1.stop('SIGINT');
});
process.once('SIGTERM', () => {
    console.log('stopping');
    bot1.stop('SIGTERM');
    bot2.stop('SIGTERM');
    bot3.stop('SIGTERM');
    automateBot1.stop('SIGTERM');
});

process.on('unhandledRejection', async function (error, p) {
    if (error['response'] && error['response'].error_code == 409) {
        console.log('Relaunching Bots ********');
        await bot1.stop();
        await bot2.stop();
        await bot3.stop();
        await automateBot1.stop();
        await telegram.sleep(5000);
        launchBots();
    }
});

export { bot1, bot2, bot3, automateBot1 };
