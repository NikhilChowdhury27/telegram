const CronJob = require('cron').CronJob;
import PubSubService from '../app/consumers/gcp.pubsub.consumer';
// import MemberService from '../app/api/members/services/member.service';

const checkMmeberCron = new CronJob(
    '*/6 * * * *', // '* * * * * *',
    async function () {
        console.log('Retry check member job running');
        try {
            // if (parseInt(process.env.IS_PUBSUB_ENABLED)) {
            //     PubSubService.sendMessage(
            //         {},
            //         process.env.PUBSUB_TELEGRAM_TOPIC,
            //         {
            //             type: 'checkMember'
            //         }
            //     );
            // } else {
            //     await MemberService.checkMemberStatus();
            // }

            PubSubService.sendMessage({}, process.env.PUBSUB_TELEGRAM_TOPIC, {
                type: 'checkMember'
            });
        } catch (e) {
            console.log('Retry check member job running err ', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);
export default checkMmeberCron;
