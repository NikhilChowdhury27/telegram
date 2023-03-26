const CronJob = require('cron').CronJob;
import GroupService from '../app/api/groups/services/group_V2';

const logsCron = new CronJob(
    '*/8 * * * *', // 0 */5 * * *
    function () {
        console.log('logs jobs running');
        try {
            GroupService.logsCronJob();
        } catch (e) {
            console.log('logs jobs running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default logsCron;
