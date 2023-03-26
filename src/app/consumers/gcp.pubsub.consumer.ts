const { PubSub } = require('@google-cloud/pubsub');
import RedisManager from '../../config/conf/RedisCache';
// import orderService from '../api/orders/services/orders.service';
import MemberService from '../api/members/services/member.service';
import groupService from '../api/groups/services/group';
import GroupServiceV2 from '../api/groups/services/group_V2';
import orderService from '../api/orders/services/orders.service';
import orderServiceV2 from '../api/orders/services/order.service.v2';
import { sendNotificationToGoogleChat } from '../utils/alert.utils';
import { WEBHOOK_CHAT_URL } from '../../config/constant';

class PubSubService {
    private static __client: any;

    static get client() {
        if (!PubSubService.__client) {
            PubSubService.__client = new PubSub();
        }
        return PubSubService.__client;
    }

    static async sendMessage(payload, topicName, attributes: any) {
        try {
            const { uuid } = payload;
            console.log('A-1', payload, attributes);
            const dataBuffer = Buffer.from(JSON.stringify(payload));
            let message = {
                data: dataBuffer,
                orderingKey: uuid
            };

            let messageId;
            if (uuid) {
                messageId = await PubSubService.client
                    .topic(topicName, { enableMessageOrdering: true })
                    .publishMessage(message);
            } else {
                messageId = await PubSubService.client
                    .topic(topicName)
                    .publish(dataBuffer, attributes);
            }

            console.log(`Message ${messageId} published.`);
            return messageId;
        } catch (err) {
            console.error('PubSub SendMessage Error: ', err);
            return null;
        }
    }

    static pollForTopicMessages(subscriptionName) {
        try {
            console.debug(subscriptionName, '- listening');
            const subscription =
                PubSubService.client.subscription(subscriptionName);
            const messageHandler = async (message) => {
                console.log(
                    'subscriptionName',
                    subscriptionName,
                    message.attributes
                );
                console.log(`Received message ${message.id}:`);
                console.log(`\tData: ${message.data.toString()}`);
                let res;
                let redisCount;
                // const data = JSON.parse(message.data.toString());
                if (message && message.attributes.type === 'checkMember') {
                    res = await MemberService.checkMemberStatus();
                    redisCount = await RedisManager.getCount(
                        message.attributes.type
                    );
                    console.log('checkMember res', res);
                }

                if (message && message.attributes.type === 'checkCreator') {
                    res = await groupService.checkAdminStatus();
                    redisCount = await RedisManager.getCount(
                        message.attributes.type
                    );
                    console.log('checkCreator res', res);
                }
                if (message && message.attributes.type === 'RemoveUsers') {
                    res = await groupService.removeFromGroup();
                    redisCount = await RedisManager.getCount(
                        message.attributes.type
                    );
                    console.log('RemoveUsers res', res);
                }
                if (message && message.attributes.type === 'webhookEvent') {
                    const paylaod = JSON.parse(message.data.toString());
                    console.log('inside Links webhook');
                    res = await orderService.rzpWebhookHandler(
                        paylaod.data,
                        paylaod.razorpaySignature
                    );

                    redisCount = await RedisManager.getCount(
                        message.attributes.type
                    );
                    console.log('Razorpay res', res);
                }
                if (
                    message &&
                    message.attributes.type === 'webhookLinksEvent'
                ) {
                    const paylaod = JSON.parse(message.data.toString());
                    res = await orderServiceV2.rzpLinksWebhookHandler(paylaod);
                    redisCount = await RedisManager.getCount(
                        message.attributes.type
                    );
                    console.log('Razorpay res', res);
                }
                if (message && message.attributes.type === 'editGroup') {
                    const paylaod = JSON.parse(message.data.toString());
                    res = await groupService.updateGroupWithCoupons(
                        paylaod.data
                    );
                    console.log('UpdateGroup res', res);
                }
                if (
                    message &&
                    message.attributes.type === 'classplusWebhookEvent'
                ) {
                    const paylaod = JSON.parse(message.data.toString());
                    res = await GroupServiceV2.classplusWebhookUsesAddition(
                        paylaod
                    );
                    console.log('Classplus Webhook res', res);
                }
                console.log('redis cron failure count', redisCount);
                if (res || redisCount === '2') {
                    console.log(
                        'message Acknowledged',
                        message.attributes.type
                    );
                    await RedisManager.delMember(message.attributes.type);
                    message.ack();
                }
            };
            const errorHandler = function (err) {
                console.log('Receive Error in pub sub', err);
            };
            subscription.on('message', messageHandler);
            subscription.on('error', errorHandler);
        } catch (err) {
            process.env.ENVIRONMENT === 'production' &&
                sendNotificationToGoogleChat(WEBHOOK_CHAT_URL, {
                    action: 'PUBSUB_CONSUMER',
                    data: err
                });
        }
    }

    static subscribeToTopics() {
        if (process.env.IS_CONSUMER_ENABLED === 'true') {
            PubSubService.pollForTopicMessages(
                process.env.RAZORPAY_WEBHOOK_TOPIC_CONTENT_SUB
            );
        }
    }
}

export default PubSubService;
