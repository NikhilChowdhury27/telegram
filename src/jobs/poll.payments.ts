const CronJob = require('cron').CronJob;
import orderService from '../app/api/orders/services/orders.service';

const pollCron = new CronJob(
    '*/23 * * * *', // '* * * * * *',
    async function () {
        console.log('group bot add job running');
        try {
            await orderService.manualPaymentCheck(
                null,
                null,
                null,
                30,
                'MINUTE',
                'Attempted',
                '',
                true
            );
        } catch (e) {
            console.log(e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default pollCron;
