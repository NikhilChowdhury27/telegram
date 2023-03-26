const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');
import PubSubService from '../../../consumers/gcp.pubsub.consumer';
import {
    ERROR_400,
    ERROR_500,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';
import { sendNotificationToGoogleChat } from '../../../../app/utils/alert.utils';
import { CLASSPLUS_WEBHOOK_CHAT_URL } from '../../../../config/constant';
const crypto = require('crypto');
// import GroupServiceV2 from '../services/group_V2';

export default class ClassplusWebhook extends MasterController {
    static doc() {
        return {
            tags: ['group'],
            description: 'Classplus Webhook Members',
            summary: 'Classplus Webhook Members'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                email: Joi.string().optional().allow(''),
                mobile: Joi.string()
                    .custom((value, helper) => {
                        if (value.length < 12) {
                            return helper.message(
                                '10 digit mobile is required'
                            );
                        }
                        if (!/^(\91)[6789]\d{9}$/.test(value)) {
                            return helper.message('Invalid mobile number');
                        }
                        return true;
                    })
                    .required(),
                amountPaid: Joi.number().required(),
                joiningDate: Joi.string().optional().allow(''),
                expiryDate: Joi.string().optional().allow(''),
                name: Joi.string().min(3).required(),
                courseId: Joi.number().required(),
                orgId: Joi.number().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            const generatedHash = crypto
                .createHash('md5')
                .update(process.env.CLASSPLUS_WEBHOOK_SECRET)
                .digest('hex');
            console.log(
                'Hash from claaplus',
                generatedHash,
                this.req.headers['x-access-token']
            );

            if (generatedHash !== this.req.headers['x-access-token']) {
                sendNotificationToGoogleChat(CLASSPLUS_WEBHOOK_CHAT_URL, {
                    source: 'CLASSPLUS WEBHOOK LOGS',
                    data: JSON.stringify(this.req.headers['x-access-token'])
                });
                return new ResponseBuilder(
                    400,
                    {
                        message: 'Invalid Signature'
                    },
                    ERROR_400
                );
            }

            // GroupServiceV2.classplusWebhookUsesAddition(this.data);
            PubSubService.sendMessage(
                this.data,
                process.env.PUBSUB_WEBHOOK_TOPIC,
                {
                    type: 'classplusWebhookEvent'
                }
            );
            return new ResponseBuilder(200, {}, SUCCESS_200);
        } catch (e) {
            console.error('::Classplus webhook Error:: ', e);
            sendNotificationToGoogleChat(CLASSPLUS_WEBHOOK_CHAT_URL, {
                source: 'CLASSPLUS WEBHOOK',
                data: JSON.stringify(e)
            });
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
