import { CHAT_URL } from '../../../config/constant';
import { sendNotificationToGoogleChat } from '../alert.utils';

let axios = require('axios');
export default class whatsappAutomation {
    static findAdminAndUpdateAdminRightsWhatsapp = async (payload: any) => {
        // //steps:
        // 1. get business number by channel id
        // 2. get creator number to be checked for admin status
        // 3. call get admins and check the creators status
        // 4. update to success as status

        // hggh
        try {
            // 1.
            // 2.
            const {
                channelId,

                mobile,
                whatsappNumber,
                phoneId
            } = payload;
            console.log('WHATSAPP-ADMIN-PAYLOAD', payload, whatsappNumber);

            // 3.

            let config = {
                method: 'get',
                url: `https://api.maytapi.com/api/aacb73b1-6e8b-40e7-b85e-ef8d03a2659e/${phoneId}/getGroups/${channelId}@g.us`,
                headers: {
                    'x-maytapi-key': '92294dc9-5737-4e5b-8276-142058c3cfe7'
                }
            };

            const result = await axios(config);

            console.log('ADMINS', result.data.data.admins);

            if (!result.data) {
                return false;
            }

            const findAdmin = result.data.data.admins.indexOf(mobile + '@c.us');

            return findAdmin >= 0;
        } catch (err) {
            sendNotificationToGoogleChat(CHAT_URL, {
                source: `EDIT ADMIN, WHATSAPP`,
                context: {
                    action: 'FETCH_ADMIN',
                    payload: JSON.stringify(payload)
                },

                error: JSON.stringify(err)
            });
            console.log('telegram member check  error', err);
            // not needed as userId does not changes in telegram
            // if (err.errorMessage === 'PARTICIPANT_ID_INVALID') {
            //     await this.checkAndUpdateUser(
            //         {
            //             mobile,
            //             id
            //         },
            //         client
            //     );
            //     return false;
            // }
            // await client.destroy();
            return false;
        }
    };
}
