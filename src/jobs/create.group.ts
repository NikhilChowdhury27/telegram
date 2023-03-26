const CronJob = require('cron').CronJob;
import groupService from '../app/api/groups/services/group';

const createGroupCron = new CronJob(
    '*/5 0-1,5-23 * * *', // '* * * * * *',
    async function () {
        console.log('Retry creating group job running');
        try {
            await groupService.createGroup();
        } catch (e) {
            console.log('Retry creating group job running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default createGroupCron;
