import { userAgent } from '../../config/constants/common.const';

const { MasterController } = require('base-packages');

export default class CommonController extends MasterController {
    static get(router, path, middlewares) {
        super.get(router, path, middlewares);
    }

    static post(router, path, middlewares) {
        super.post(router, path, middlewares);
    }

    static patch(router, path, middlewares) {
        super.patch(router, path, middlewares);
    }

    static put(router, path, middlewares) {
        super.put(router, path, middlewares);
    }

    static delete(router, path, middlewares) {
        super.delete(router, path, middlewares);
    }

    isMobile() {
        return this.headers['user-agent'] !== userAgent.WEB;
    }

    isAndroid() {
        return this.headers['user-agent'] === userAgent.ANDROID;
    }

    isIos() {
        return this.headers['user-agent'] === userAgent.IOS;
    }
}
