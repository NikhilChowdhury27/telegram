const CronJob = require('cron').CronJob;
import groupService from '../app/api/groups/services/group';

const checkCreatorWhatsappCron = new CronJob(
    '*/2 * * * *', // '* * * * * *',
    async function () {
        console.log('Retry creator whatsapp check job running');
        try {
            await groupService.checkAdminStatusWhatsapp();
        } catch (e) {
            console.log('Retry creator check job running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default checkCreatorWhatsappCron;
