const CronJob = require('cron').CronJob;
import MemberService from '../app/api/members/services/member.service';

const AddToWhatsapp = new CronJob(
    '*/3 * * * *',
    async function () {
        console.log('Retry add whatsapp job running');
        try {
            await MemberService.retryAddWhatsapp();
        } catch (e) {
            console.log('Retry add whatsapp job running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);
export default AddToWhatsapp;
