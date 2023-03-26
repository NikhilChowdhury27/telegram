const CronJob = require('cron').CronJob;
import orderService from '../app/api/orders/services/orders.service';

const generateReceiptsCron = new CronJob(
    '* * * * *', // '* * * * * *',
    async function () {
        console.log('invoice/receipt cron running...');
        try {
            await orderService.receiptCron();
        } catch (e) {
            console.log(e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default generateReceiptsCron;
