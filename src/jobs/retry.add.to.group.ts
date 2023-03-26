const CronJob = require('cron').CronJob;
import MemberService from '../app/api/members/services/member.service';

const addToGroup = new CronJob(
    '*/5 * * * *', // '* * * * * *',
    async function () {
        console.log('Retry add job running');
        try {
            await MemberService.retryAdd();
        } catch (e) {
            console.log('Retry add job running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);
export default addToGroup;
