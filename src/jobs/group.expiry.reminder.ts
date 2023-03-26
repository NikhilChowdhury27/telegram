const CronJob = require('cron').CronJob;
import memberService from '../app/api/members/services/member.service';

const groupExpiryReminder = new CronJob(
    '0 */4 * * *', // '* * * * * *',
    async function () {
        console.log('Group expiry reminder jobs running');
        try {
            await memberService.expiryReminder();
        } catch (e) {
            console.log('Group expiry reminder jobs running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default groupExpiryReminder;
