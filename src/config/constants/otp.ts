import Common from './common';
import {
    EITHER_MOBILE_EMAIL_REQUIRED,
    COUNTRY_EXT_MOBILE_REQ,
    MAX_ATTEMPTS_REACHED,
    INVALID_OTP,
    VERIFY_SUCCESSFUL,
    OTP_CODE_SENT,
    YOUR_ONE_TIME_PASSWORD,
    VIASMS_OR_VIAEMAIL,
    RETRY_VOICE_NOT_POSSIBLE,
    NO_UNUSED_OTP,
    OTP_IS_MISSING,
    INVALID_MOB_NUMBER,
    EMAIL_IS_REQUIRED
} from './errorMessages';

export default class OTP extends Common {
    static get EMAIL_OR_MOBILE_REQUIRED() {
        return EITHER_MOBILE_EMAIL_REQUIRED;
    }

    static get COUNTRY_EXT_REQUIRED() {
        return COUNTRY_EXT_MOBILE_REQ;
    }

    static get MAX_ATTEMPTS_REACHED() {
        return MAX_ATTEMPTS_REACHED;
    }

    static get INVALID_OTP() {
        return INVALID_OTP;
    }

    static get SUCCESS_VERIFY() {
        return VERIFY_SUCCESSFUL;
    }

    static get SEND() {
        return OTP_CODE_SENT;
    }

    static get TEMP() {
        return YOUR_ONE_TIME_PASSWORD;
    }

    static get VIA_SMS_OR_VIA_EMAIL_REQUIRED() {
        return VIASMS_OR_VIAEMAIL;
    }

    static get RETRY_VOICE_VIA_EMAIL() {
        return RETRY_VOICE_NOT_POSSIBLE;
    }

    static get INVALID_MOB_NUMBER() {
        return INVALID_MOB_NUMBER;
    }

    static get NO_UNUSED_OTP_FOUND() {
        return NO_UNUSED_OTP;
    }

    static get OTP_IS_MISSING() {
        return OTP_IS_MISSING;
    }

    static get EMAIL_IS_REQUIRED() {
        return EMAIL_IS_REQUIRED;
    }
}
