const axios = require('axios').default;

class WhastappConfig {
    getPhoneId(phone: string) {
        switch (phone) {
            case process.env.WP_1:
                return process.env.WP_1_PHONEID;
            case process.env.WP_2:
                return process.env.WP_2_PHONEID;
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    getPhone() {
        const r = this.getRandomInt(2);
        console.log('RANDOM-1', r);
        return r ? process.env.WP_1 : process.env.WP_2;
    }

    getPhoneAlternateId(phone: string) {
        switch (phone) {
            case process.env.WP_1:
                return process.env.WP_2_PHONEID;
            case process.env.WP_2:
                return process.env.WP_1_PHONEID;
        }
    }

    getPhoneAlternate(phone: string) {
        switch (phone) {
            case process.env.WP_1:
                return process.env.WP_2;
            case process.env.WP_2:
                return process.env.WP_1;
        }
    }

    getConfig(phoneId: number) {
        const baseUrl = `https://api.maytapi.com/api/aacb73b1-6e8b-40e7-b85e-ef8d03a2659e/${phoneId}/`;
        const headers = {
            'x-maytapi-key': '92294dc9-5737-4e5b-8276-142058c3cfe7',
            'Content-Type': 'application/json'
        };

        return {
            baseUrl,
            headers
        };
    }

    async addToGroup(payload: any, phoneId: number) {
        try {
            const { baseUrl, headers } = this.getConfig(phoneId);

            let config = {
                method: 'post',
                url: `${baseUrl}group/add`,
                headers,
                data: payload
            };

            const res = await axios(config);
            if (res && res.data) {
                return res.data;
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async removeFromGroup(payload: any, phoneId: number) {
        try {
            const { baseUrl, headers } = this.getConfig(phoneId);

            let config = {
                method: 'post',
                url: `${baseUrl}group/remove`,
                headers,
                data: payload
            };

            const res = await axios(config);
            if (res && res.data) {
                return res.data;
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async promoteInGroup(payload: any, phoneId: number) {
        try {
            const { baseUrl, headers } = this.getConfig(phoneId);

            let config = {
                method: 'post',
                url: `${baseUrl}group/promote`,
                headers,
                data: payload
            };

            const res = await axios(config);
            if (res && res.data) {
                console.log('PROMOTE', res.data);
                return res.data;
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async sendMessage(payload: any, phoneId: number) {
        try {
            const { baseUrl, headers } = this.getConfig(phoneId);

            let config = {
                method: 'post',
                url: `${baseUrl}/sendMessage`,
                headers,
                data: payload
            };

            const res = await axios(config);
            if (res && res.data) {
                console.log('MESSAGE', res.data);
                return res.data;
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async createGroup(payload: any, phoneId: number) {
        try {
            const { baseUrl, headers } = this.getConfig(phoneId);

            let config = {
                method: 'post',
                url: `${baseUrl}createGroup`,
                headers,
                data: payload
            };

            const res = await axios(config);
            if (res && res.data) {
                console.log('CREATE', res.data);
                return res.data;
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}

export default new WhastappConfig();
