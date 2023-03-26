const crypto = require('crypto');
const axios = require('axios');
const countryData = globalThis.countryData;

export default class Tazapay {
    readonly baseUrl: string = process.env.TAZAPAY_BASE_URL;
    apiKey: string;
    apiSecret: string;
    readonly salt = process.env.TAZAPAY_SALT;
    method: string;
    url: string;
    response: any = null;

    constructor(
        url: string,
        method: string,
        region: string,
        tzpDiyApiKey?: string,
        tzpDiyApiSecret?: string
    ) {
        this.url = url;
        this.method = method;
        this.apiKey = tzpDiyApiKey
            ? tzpDiyApiKey
            : countryData[region].TAZAPAY_API_KEY;
        this.apiSecret = tzpDiyApiSecret
            ? tzpDiyApiSecret
            : countryData[region].TAZAPAY_API_SECRET;
    }

    generateSignature() {
        let signature,
            timestamp = Math.round(new Date().getTime() / 1000);

        let to_sign =
            this.method +
            this.url +
            this.salt +
            timestamp +
            this.apiKey +
            this.apiSecret;
        let hash = crypto.createHmac('sha256', this.apiSecret);
        hash.update(to_sign);
        signature = Buffer.from(hash.digest('hex')).toString('base64');
        return {
            signature,
            timestamp
        };
    }

    async call(payload = {}) {
        try {
            let { signature, timestamp } = this.generateSignature();
            let config = {
                method: this.method.toLowerCase(),
                url: this.baseUrl + this.url,
                headers: {
                    timestamp,
                    salt: this.salt,
                    accesskey: this.apiKey,
                    signature,
                    'Content-Type': 'application/json'
                }
            };
            if (this.method != 'GET') {
                config['data'] = payload;
            }
            this.response = await axios(config);
        } catch (error) {
            console.log('[TazapayError]::[call method]', error);
            this.response = null;
        }
        return this;
    }
}
