const CronJob = require('cron').CronJob;
import orderService from '../app/api/orders/services/orders.service';

const generateReceiptsOldCron = new CronJob(
    '*/2 * * * *', // '* * * * * *',
    async function () {
        console.log('invoice/receipt old cron running...');
        try {
            await orderService.receiptScriptForBackGeneration();
        } catch (e) {
            console.log(e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default generateReceiptsOldCron;
