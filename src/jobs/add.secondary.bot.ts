const CronJob = require('cron').CronJob;
import groupService from '../app/api/groups/services/group';

const addBotToBackupGroupCron = new CronJob(
    '*/20 3-3 * * *', // '* * * * * *',
    async function () {
        console.log('group bot add job running');
        try {
            await groupService.addBotToBackupGroup();
        } catch (e) {
            console.log(e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default addBotToBackupGroupCron;
