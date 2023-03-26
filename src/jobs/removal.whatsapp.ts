const CronJob = require('cron').CronJob;
import GroupService from '../app/api/groups/services/group_V2';

const removeFromWhatsappCron = new CronJob(
    '*/11 * * * *', // 0 */5 * * *
    function () {
        console.log('Group kickout whatsapp jobs running');
        try {
            GroupService.removeFromGroup();
        } catch (e) {
            console.log('Group kickout whatsapp jobs running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default removeFromWhatsappCron;
