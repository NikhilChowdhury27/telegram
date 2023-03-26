const CronJob = require('cron').CronJob;
// import messageService from '../app/api/messages/services/message.service';

const addToMessage = new CronJob(
    '*/49 * * * *', // '* * * * * *',
    async function () {
        console.log('Retry add to message job running');
        try {
            // await messageService.retryAddLockedMessage();
        } catch (e) {
            console.log('Retry add to message job running', e);
        }
    },
    null,
    true,
    'Asia/Calcutta'
);
export default addToMessage;
