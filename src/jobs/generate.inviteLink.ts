const CronJob = require('cron').CronJob;
import groupService from '../app/api/groups/services/group';

const createLinks = new CronJob(
    '*/7 * * * *', // '* * * * * *',
    async function () {
        console.log('Creating links job running');
        try {
            await groupService.createGroupInviteLinks();
        } catch (e) {
            console.log('Creating links job running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default createLinks;
