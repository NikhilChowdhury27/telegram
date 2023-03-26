const CronJob = require('cron').CronJob;
import groupService from '../app/api/groups/services/group';

const createBackupGroupCron = new CronJob(
    '*/35 4-4 * * *', // '* * * * * *',
    async function () {
        console.log('Create backup group job running');
        try {
            await groupService.addRemovalBotToBackupGroup();
        } catch (e) {
            console.log(e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default createBackupGroupCron;
