const API_KEY = 'key-7096e59c56730e9638ed4c44f9af4fdb';
const DOMAIN = 'cms.classplus.co';

const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const client = mailgun.client({
    username: 'api',
    key: API_KEY
});

// (async () => {
//     const filepath = path.join(__dirname, 'gg.pdf');
//     try {
//         const buff = await fsPromises.readFile(filepath);
//         console.log(buff);
//         const file = {
//             filename: 'sample.pdf',
//             data: buff
//         };
//         const attachment = [file];

//         const data = {
//             from: 'amirsohel.as10@gmail.com',
//             to: 'amirsohel171998@gmail.com',
//             //   cc: 'baz@example.com',
//             //   bcc: 'bar@example.com',
//             subject: 'Complex',
//             text: 'Testing some Mailgun awesomness!',
//             html: '<html>HTML version of the body</html>',
//             attachment
//         };
//     } catch (error) {
//         console.error(error);
//     }
// })();

export const sendMailGunMail = async (data: any) => {
    try {
        console.log(data);
        const result = await client.messages.create(DOMAIN, data);
        console.log(result);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};
