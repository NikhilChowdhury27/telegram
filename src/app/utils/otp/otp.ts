const axios = require('axios');
const crypto = require('crypto');
import { sign, SignOptions } from 'jsonwebtoken';
class OTP {
    generateOTP() {
        const ran = Math.random() * 9000;
        return Math.floor(1000 + ran);
    }

    generateOTPHash(otp: string, mobile: string) {
        return crypto.createHash('md5').update(`${otp}${mobile}`).digest('hex');
    }

    validateOTP(otp: string, mobile: string, hash: string) {
        return (
            hash ==
            crypto.createHash('md5').update(`${otp}${mobile}`).digest('hex')
        );
    }

    async sendSmsOTP(mobile, otp, expireAT, senderId) {
        try {
            if (parseInt(process.env.IS_CE_OTP_ACTIVE) == 1) {
                const mobileWoCountryExt = mobile.slice(2);
                const cePayload = {
                    templateData: { otp: otp, hash: '' },
                    sms: {
                        mobileNumbers: [mobileWoCountryExt],
                        countryCode: '91',
                        smsType: 3, //FOR OTP it will be 3
                        metaData: {},
                        smsTemplateCode: 'FC_OTP'
                    },
                    priority: 'P0'
                };
                const payload = {
                    clientId: process.env.COMM_SERVICE_CLIENT_ID,
                    clientSecret: process.env.COMM_SERVICE_CLIENT_SECRET
                };
                const token = sign(payload, process.env.COMM_TOKEN_SECRET, <
                    SignOptions
                >{
                    expiresIn: process.env.COMM_TOKEN_EXPIRY_DURATION,
                    algorithm: process.env.COMM_ACCESS_TOKEN_ALGO
                });
                console.log('CE PAYLOD :: ', cePayload);
                const ceUrl = `${process.env.COMMUNICATION_SERVICE}/v2/Communications/sms/internal `;
                let res = await axios.post(ceUrl, cePayload, {
                    headers: {
                        'access-token': token
                    }
                });
                // if (res.status == 200) {
                //     console.log('CE OTP RESPONSE :: ', res['data']);
                // }
                if (res.status > 299 || res.status < 200) {
                    throw new Error('Failed to send OTP');
                }
            } else {
                const payload = {
                    senderId: senderId,
                    mobile: mobile,
                    otp: otp,
                    otp_expiry: expireAT,
                    countryExt: '91'
                };
                let data = await axios.post(
                    `${process.env.NOTIFICATION_SERVICE}/v1/notifications/sms/otp`,
                    payload
                );
                if (data.status > 299 || data.status < 200) {
                    throw new Error('Failed to send OTP');
                }
            }
        } catch (e) {
            console.log('[OTP]:[sendSmsOTP]', e);
            throw new Error('Failed to send OTP');
        }
    }
}

export default new OTP();
