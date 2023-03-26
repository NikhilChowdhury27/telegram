const CronJob = require('cron').CronJob;
import PubSubService from '../app/consumers/gcp.pubsub.consumer';
// import GroupService from '../app/api/groups/services/group';

const removeFromGroupCron = new CronJob(
    '*/10 * * * *', // 0 */5 * * *
    function () {
        console.log('Group kickout jobs running');
        try {
            // if (parseInt(process.env.IS_PUBSUB_ENABLED)) {
            //     PubSubService.sendMessage(
            //         {},
            //         process.env.PUBSUB_TELEGRAM_TOPIC,
            //         {
            //             type: 'RemoveUsers'
            //         }
            //     );
            // } else {
            //     await GroupService.removeFromGroup();
            // }
            PubSubService.sendMessage({}, process.env.PUBSUB_TELEGRAM_TOPIC, {
                type: 'RemoveUsers'
            });
        } catch (e) {
            console.log('Group kickout jobs running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default removeFromGroupCron;
