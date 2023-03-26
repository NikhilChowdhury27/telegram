import { sign, SignOptions } from 'jsonwebtoken';
import memberGroupMap from '../repository/member.group.map';

const axios = require('axios');

class Group {
    async sendSms(
        mobile: string[],
        userId: number,
        token: string,
        groupId: number,
        templateData: any,
        smsTemplateCode: string,
        type: string
    ) {
        try {
            console.log('TEMPLATE- ', templateData);
            if (templateData.userName) {
                templateData.userName =
                    templateData.userName.length >= 25
                        ? templateData.userName.substring(0, 25) + '...'
                        : templateData.userName;
            }
            if (templateData.groupName) {
                templateData.groupName =
                    templateData.groupName.length >= 25
                        ? templateData.groupName.substring(0, 25) + '...'
                        : templateData.groupName;
            }
            if (templateData.groupAdmin) {
                templateData.groupAdmin =
                    templateData.groupAdmin.length >= 25
                        ? templateData.groupAdmin.substring(0, 25) + '...'
                        : templateData.groupAdmin;
            }
            if (templateData.channelName) {
                templateData.channelName =
                    templateData.channelName.length >= 25
                        ? templateData.channelName.substring(0, 25) + '...'
                        : templateData.channelName;
            }
            if (templateData.adminName) {
                templateData.adminName =
                    templateData.adminName.length >= 25
                        ? templateData.adminName.substring(0, 25) + '...'
                        : templateData.adminName;
            }
            if (!token) {
                const payload = {
                    clientId: process.env.COMM_SERVICE_CLIENT_ID,
                    clientSecret: process.env.COMM_SERVICE_CLIENT_SECRET
                };
                token = sign(payload, process.env.COMM_TOKEN_SECRET, <
                    SignOptions
                >{
                    expiresIn: process.env.COMM_TOKEN_EXPIRY_DURATION,
                    algorithm: process.env.COMM_ACCESS_TOKEN_ALGO
                });
            }
            const payload = {
                orgId: process.env.COMM_ACCESS_SMS_ORG_ID,
                senderId: process.env.COMM_ACCESS_SMS_SENDER_ID,
                service: 7,
                templateData: [templateData],
                sms: {
                    smsTemplateCode: smsTemplateCode,
                    mobileNumbers: mobile,
                    countryCode: '91',
                    userIds: [],
                    smsType: 1
                },
                priority: 'P1'
            };
            const headers = {
                headers: {
                    'access-token': token,
                    'Content-Type': 'application/json'
                }
            };

            let data = await axios.post(
                `${process.env.COMMUNICATION_SERVICE}/v2/Communications/sms/bulk/internal`,
                payload,
                headers
            );
            // console.log('sms sent via cron ', data);
            if (data.status > 299 || data.status < 200) {
                console.error('Failed to send sms');
                return (
                    type === 'expiryreminder' &&
                    (await memberGroupMap.updateGroupMemberCronStatus(
                        userId,
                        groupId,
                        'pending'
                    ))
                );
            }
            return data;
        } catch (e) {
            console.log('sendSms', e.message);
        }
    }

    async sendEmail(
        email: string[],
        subject: string,
        // userName: string,
        // groupName: string,
        // numberOfDays: number,
        templateId: number,
        token: string,
        // userId: number,
        // groupId: number,
        templateData?: any,
        attachmentUrls?: string[]
    ) {
        try {
            const accessToken = token || (await this.generateMailToken());
            const payload = {
                orgId: process.env.COMM_ACCESS_SMS_ORG_ID,
                senderId: process.env.COMM_ACCESS_EMAIL_SENDER_ID,
                type: 1,
                service: 3,
                email: {
                    subject: subject,
                    to: email,
                    attachmentUrls
                },
                templateId: templateId,
                templateData: templateData,
                priority: 'P2'
            };
            const headers = {
                headers: {
                    'access-token': accessToken,
                    'Content-Type': 'application/json'
                }
            };

            let data = await axios.post(
                `${process.env.COMMUNICATION_SERVICE}/v2/addCommunication/email/internal`,
                payload,
                headers
            );
            // console.log('email status', data.data);
            // if (data.status > 299 || data.status < 200) {
            //     console.error('Failed to send email');
            //     return await memberGroupMap.updateGroupMemberCronStatus(
            //         userId,
            //         groupId,
            //         'pending'
            //     );
            // }
            return data;
        } catch (e) {
            console.log('[OTP]:[sendEmailOTP]', e);
            throw new Error('Failed to send email');
        }
    }

    async generateMailToken() {
        const payload = {
            clientId: process.env.COMM_SERVICE_CLIENT_ID,
            clientSecret: process.env.COMM_SERVICE_CLIENT_SECRET
        };
        const token = await sign(payload, process.env.COMM_TOKEN_SECRET, <
            SignOptions
        >{
            expiresIn: process.env.COMM_TOKEN_EXPIRY_DURATION,
            algorithm: process.env.COMM_ACCESS_TOKEN_ALGO
        });
        return token;
    }

    async generateGroupExpiryText(groupId, groupName) {
        let link = `${process.env.PAYMENT_DOMAIN}/g/${groupId}`;
        const text = `Subscription Renewal: Your ${groupName} group membership is up for renewal within 7 days. Head to the link to renew membership ${link}.- Classplus`;
        return text;
    }

    links(groupId, name, about, message?: string, channel?: string) {
        const url = `${process.env.PAYMENT_DOMAIN}/g/${groupId}`;
        const text =
            message ||
            `Hey! Pay through the below link to get added to my ${channel} channel.\n\nChannel Name: ${name}\nChannel Overview: ${about}\n${url}`;
        return {
            links: [
                {
                    type: 'WHATSAPP',
                    iconUrl:
                        'https://cdn-cp-assets-public.classplus.co/cams/store/icon/icon_whatsap.png',
                    shareUrl: `https://api.whatsapp.com/send?text=${text}`,
                    shareText: `${text}`,
                    appName: 'WhatsApp'
                },
                {
                    type: 'FACEBOOK',
                    iconUrl:
                        'https://cdn-cp-assets-public.classplus.co/cams/store/icon/icon_fb.png',
                    shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${text}`,
                    shareText: `${text}`,
                    appName: 'Facebook'
                },
                {
                    type: 'TELEGRAM',
                    iconUrl:
                        'https://cdn-cp-assets-public.classplus.co/cams/store/icon/icon_telegram.png',
                    shareUrl: `https://t.me/share/url?url=${text}`,
                    shareText: `${text}`,
                    appName: 'Telegram'
                }
            ],
            copyUrl: url,
            moreAppsText: `${text}`,
            publishText: ''
        };
    }

    msglinks(msgId, name, about) {
        const url = `${process.env.PAYMENT_DOMAIN}/m/${msgId}`;
        const text = `Hey! Pay through the below link to get access to my exclusive content on telegram.\n\nContent Title: ${name}\nContent Description: ${about}\n${url}`;
        return {
            links: [
                {
                    type: 'WHATSAPP',
                    iconUrl:
                        'https://dtxqtzf8mpl38.cloudfront.net/cams/store/icon/icon_whatsap.png',
                    shareUrl: `https://api.whatsapp.com/send?text=${text}`,
                    shareText: `${text}`,
                    appName: 'WhatsApp'
                },
                {
                    type: 'FACEBOOK',
                    iconUrl:
                        'https://dtxqtzf8mpl38.cloudfront.net/cams/store/icon/icon_fb.png',
                    shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${text}`,
                    shareText: `${text}`,
                    appName: 'Facebook'
                },
                {
                    type: 'TELEGRAM',
                    iconUrl:
                        'https://dtxqtzf8mpl38.cloudfront.net/cams/store/icon/icon_telegram.png',
                    shareUrl: `https://t.me/share/url?url=${text}`,
                    shareText: `${text}`,
                    appName: 'Telegram'
                }
            ],
            copyUrl: url,
            moreAppsText: `${text}`,
            publishText: ''
        };
    }
}

export default new Group();
