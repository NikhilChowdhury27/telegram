import CommunicationLogs from '../../../models/CommunicationLogs';

const axios = require('axios').default;

class FreshChatService {
    feedParamsIntoTemplate = (
        template_name: string,
        params: { data: string }[]
    ) => {
        return {
            message_template: {
                storage: 'conversation',
                template_name,
                namespace: process.env.FRESHCHAT_NAMESPACE,
                language: {
                    policy: 'deterministic',
                    code: 'en'
                },
                rich_template_data: {
                    body: {
                        params
                    }
                }
            }
        };
    };

    getRequestFreshChatRequest = (data: any, mobile: string) => {
        return {
            method: 'POST',
            url: `${process.env.FRESHCHAT_BASE_URL}/v2/outbound-messages/whatsapp`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.FRESHCHAT_AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                from: { phone_number: '+917669788713' },
                provider: 'whatsapp',
                to: [{ phone_number: `+${mobile}` }],
                data
            }
        };
    };

    sendOtpFreshchatServiceRequest = async (
        otp: string,
        mobile: string,
        groupId
    ) => {
        const data = otp;
        const messagePayload = this.feedParamsIntoTemplate('otptemplate', [
            { data }
        ]);

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'sendOtp', groupId);
    };

    sendJoiningLinkFreshchatServiceRequest = (
        userName: string,
        channelName: string,
        joiningLink: string,
        mobile: string,
        groupId
    ) => {
        const messagePayload = this.feedParamsIntoTemplate('succesfulpayment', [
            { data: userName },
            { data: channelName },
            { data: joiningLink }
        ]);

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'paymentSuccess', groupId);
    };

    sendPaymentReminderFreshchatServiceRequest = (
        userName: string,
        channelName: string,
        expire_Days: string,
        payment_Link: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate('paymentreminder', [
            { data: userName },
            { data: channelName },
            { data: expire_Days },
            { data: payment_Link }
        ]);

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'paymentReminder', groupId);
    };

    sendPlanExpiryFreshchatServiceRequest = (
        userName: string,
        channelName: string,
        paymentLink: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate('planexpiry', [
            { data: userName },
            { data: channelName },
            { data: paymentLink }
        ]);

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'planExpiry', groupId);
    };

    sendConditionalFormLinkFreshchatServiceRequest = (
        userName: string,
        channelName: string,
        formLink: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate(
            'conditionalinvitelink',
            [{ data: userName }, { data: channelName }, { data: formLink }]
        );

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'conditionalInvite', groupId);
    };

    sendCoAdminFreshchatServiceRequest = (
        channelName: string,
        inviteLink: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate(
            'coadmininvitelink',
            [{ data: channelName }, { data: inviteLink }]
        );

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'coadminInvite', groupId);
    };

    sendWAuserAdditionFreshchatServiceRequest = (
        channelName: string,
        type: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate('wauseraddition', [
            { data: channelName },
            { data: type }
        ]);

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'whatsappUserAddition', groupId);
    };

    sendWAadminPromotionFreshchatServiceRequest = (
        creatorName: string,
        channelName: string,
        type: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate('waadminpromotion', [
            { data: creatorName },
            { data: channelName },
            { data: type }
        ]);

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'whatsappAdminPromotion', groupId);
    };

    sendWAReminderFreshchatServiceRequest = (
        userName: string,
        channelName: string,
        type: string,
        expireDays: string,
        paymentLink: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate(
            'paymentreminderwa',
            [
                { data: userName },
                { data: channelName },
                { data: type },
                { data: expireDays },
                { data: paymentLink }
            ]
        );

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'whatsappPaymentReminder', groupId);
    };

    sendWAplanExpiryFreshchatServiceRequest = (
        userName: string,
        channelName: string,
        type: string,
        paymentLink: string,
        mobile: string,
        groupId: number
    ) => {
        const messagePayload = this.feedParamsIntoTemplate('planexpirywa', [
            { data: userName },
            { data: channelName },
            { data: type },
            { data: paymentLink }
        ]);

        const request = this.getRequestFreshChatRequest(messagePayload, mobile);
        return this.callfreshChat(request, 'whatsappPlanExpiry', groupId);
    };

    getRequestDetails = async (request_id: string) => {
        let options = {
            method: 'GET',
            url: 'https://api.in.freshchat.com/v2/outbound-messages',
            params: { request_id },
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.FRESHCHAT_AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.request(options);
        return response.data;
    };

    callfreshChat = async (
        options: any,
        eventType?: string,
        groupId?: number
    ) => {
        const response = await axios.request(options);
        console.log(options.data);
        if (eventType && response) {
            console.log('yes');
            try {
                await CommunicationLogs.create({
                    groupId,
                    eventType,
                    mobile: options.data.to[0].phone_number,
                    requestId: response.data.request_id,
                    type: 'whatsapp'
                });
            } catch (err) {
                console.log(err);
            }
        }
        return response;
    };
}

export default new FreshChatService();
