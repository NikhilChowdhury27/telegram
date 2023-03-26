import Common from './common';
import { GUEST_CANT_LOGIN, GUEST_USER } from './errorMessages';

export default class Guest extends Common {
    static get ERROR_USER_AS_GEUST() {
        return GUEST_CANT_LOGIN;
    }

    static get IMAGE_URL() {
        return 'https://whitelabel-assets.s3.ap-south-1.amazonaws.com/production/single/learn/504d8768-776b-4dd8-8b0e-36ee617e6876.png';
    }

    static get GUEST_NAME() {
        return GUEST_USER;
    }
}
