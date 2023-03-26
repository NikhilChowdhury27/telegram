const CronJob = require('cron').CronJob;
import PubSubService from '../app/consumers/gcp.pubsub.consumer';
// import groupService from '../app/api/groups/services/group';

const checkCreatorCron = new CronJob(
    '*/2 * * * *', // '* * * * * *',
    async function () {
        console.log('Retry creator check job running');
        try {
            // if (parseInt(process.env.IS_PUBSUB_ENABLED)) {
            //     PubSubService.sendMessage(
            //         {},
            //         process.env.PUBSUB_TELEGRAM_TOPIC,
            //         {
            //             type: 'checkCreator'
            //         }
            //     );
            // } else {
            //     await groupService.checkAdminStatus();
            // }
            PubSubService.sendMessage({}, process.env.PUBSUB_TELEGRAM_TOPIC, {
                type: 'checkCreator'
            });
        } catch (e) {
            console.log('Retry creator check job running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default checkCreatorCron;
