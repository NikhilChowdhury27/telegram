const CronJob = require('cron').CronJob;
import statsService from '../app/api/stats/services/stats.services';

const generateReport = new CronJob(
    '*/10 * * * *', // '* * * * * *',
    async function () {
        console.log('Creating reports job running');
        try {
            await statsService.reportCron();
        } catch (e) {
            console.log('Creating links job running err', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);

export default generateReport;
