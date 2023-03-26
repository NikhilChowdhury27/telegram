require('./instana');
// import telegram from './app/utils/telegram/telegram.common';
// import { PubSub } from '@google-cloud/pubsub';
// import groupService from './app/api/groups/services/group';
import PubSubService from './app/consumers/gcp.pubsub.consumer';
require('dotenv').config();
// Instantiates a client
// const pubsub = new PubSub({ keyFile: './samplekey.json' });
const redis = require('redis');
// Creates a new topic
// const subscription = pubsub.subscription('test-fk-sub');
// console.log(`Topic ${subscription} created.`);

// env validation

const envconfig = require('./config/envValidation');
console.log('ENV VALIDATION PASSED', envconfig);

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// if (process.env.NODE_ENV === 'production') {
//     require('@instana/collector')();
// }

import { config } from './config/config';
globalThis.countryData = require('../countryData.json');
import ProcessMonitor from './processMonitor';
import nodeCache from './nodeCache';
// import PubSubService from './app/consumers/gcp.pubsub.consumer';
// import groupService from './app/api/groups/services/group';

// if (process.env.IS_CONSUMER_ENABLED === 'true') {
//     let gcpPubSub = require('./app/consumers/gcp.pubsub.consumer').default;
//     setTimeout(() => {
//         gcpPubSub.subscribeToTopics();
//     }, 1000);
// }

// Init the express application
let app = require('./config/express')();
// Init base packages
require('./config/basePackages')();

// Init jobs
// require('./jobs/group.expiry.reminder')();
if (parseInt(process.env.CRON_ENABLED)) {
    require('./jobs/index');
}

process.on('uncaughtException', function (err) {
    console.log('Process Error:', err);
});

// Start the app by listening on <port>
let server = app.get('server').listen(config.port);
server.keepAliveTimeout = 61 * 1000;
server.headersTimeout = 65 * 1000;

// redis
export const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_URL}`
});

(async () => {
    await redisClient.connect();
})();

redisClient.on('connect', function () {
    console.log('Redis Database connected' + '\n');
});

redisClient.on('reconnecting', function () {
    console.log('Redis client reconnecting');
});

redisClient.on('ready', function () {
    console.log('Redis client is ready');
});

redisClient.on('error', function (err) {
    console.log('Something went wrong in redis' + err);
});

redisClient.on('end', function () {
    console.log('\nRedis client disconnected');
    console.log('redis Server is going down now...');
    process.exit();
});

ProcessMonitor.start();
setInterval(function () {
    nodeCache.setUserBlockedNodeCache();
}, 300000);

console.log('Process alive ->', ProcessMonitor.isAlive());

import { bot1, bot2, bot3, automateBot1 } from './app/utils/bot/telegraf.bot';

export function launchBots() {
    console.log('launch bots--->');

    bot1.launch({ allowedUpdates: ['chat_member', 'chat_join_request'] })
        .then(() => {
            console.log('Bot 1 Running');
        })
        .catch((err) => {
            console.log(`Error Running Bot: ${err}`);
        });

    bot2.launch({ allowedUpdates: ['chat_member', 'chat_join_request'] })
        .then(() => {
            console.log('Bot 2 Running');
        })
        .catch((err) => {
            console.log(`Error Running Bot: ${err}`);
        });

    bot3.launch({ allowedUpdates: ['chat_member', 'chat_join_request'] })
        .then(() => {
            console.log('Bot 3 Running');
        })
        .catch((err) => {
            console.log(`Error Running Bot: ${err}`);
        });

    automateBot1
        .launch({
            allowedUpdates: [
                'chat_member',
                'my_chat_member',
                'message',
                'chat_join_request'
            ]
        })
        .then(() => {
            console.log('Bot 4 Running');
        })
        .catch((err) => {
            console.log(`Error Running Bot: ${err}`);
        });
}

parseInt(process.env.LISTENER_BOT_ENABLED) && launchBots();
// redisClient.on('connect', () => {
//     console.log('connected with redis');
// });
// redisClient.on('error', () => {
//     console.log('connected with redis');
// });

console.log(
    'env',
    process.env.IS_PUBSUB_ENABLED,
    process.env.CRON_ENABLED,
    process.env.LISTENER_BOT_ENABLED
);

if (parseInt(process.env.IS_PUBSUB_ENABLED)) {
    PubSubService.pollForTopicMessages(process.env.PUBSUB_WEBHOOK_SUB);
    PubSubService.pollForTopicMessages(process.env.PUBSUB_TELEGRAM_SUB);
    PubSubService.pollForTopicMessages(process.env.FK_COMMON_SUB);
}

// PubSubService.pollForTopicMessages(
//     process.env.PUBSUB_TELEGRAM_SUB2,
//     groupService.addUserToGroupCallback
// );

// Expose app
exports = module.exports = app;

// Logging initialization
console.log(
    `${config.app.title} started on ${config.hostname} : ${config.port} in ${
        process.env.NODE_ENV
    } mode on ${new Date().toISOString()}`
);
