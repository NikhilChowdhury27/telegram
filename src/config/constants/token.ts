import Common from './common';
import {
    TOKEN_EXPIRED_400,
    TOKEN_INVALID,
    TOKEN_ISSUED,
    TOKEN_EXPIRED_ERROR,
    JSON_WEB_TOKEN_ERROR
} from './errorMessages';

export default class Token extends Common {
    static get ERROR_TOKEN_EXP() {
        return TOKEN_EXPIRED_400;
    }

    static get ERROR_TOKEN_INVALID() {
        return TOKEN_INVALID;
    }

    static get TOKEN_ISSUED() {
        return TOKEN_ISSUED;
    }

    static get ERROR_TOKEN_EXP_NAME() {
        return TOKEN_EXPIRED_ERROR;
    }

    static get ERORR_JSON_WEB_ROKEN() {
        return JSON_WEB_TOKEN_ERROR;
    }
}
