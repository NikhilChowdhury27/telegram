import Common from './common';
import {
    UNABLE_TO_IDENTIFY_USER_TYPE,
    UPDATE_DATA_SUCCESS,
    NOTHING_TO_UPDATE,
    UNABLE_TO_IDENTIFY_TUTOR,
    BANK_DETAILS_ALREADY_ADDED,
    TAB_UPDATE_DATA_SUCCESS,
    INSUFFICIENT_BANK_DETAILS
} from './errorMessages';

export default class Profile extends Common {
    static get UNABLE_TO_IDENTIFY_USER_TYPE() {
        return UNABLE_TO_IDENTIFY_USER_TYPE;
    }

    static get UPDATE_DATA_SUCCESS() {
        return UPDATE_DATA_SUCCESS;
    }

    static get NOTHING_TO_UPDATE() {
        return NOTHING_TO_UPDATE;
    }
    static get UNABLE_TO_IDENTIFY_TUTOR() {
        return UNABLE_TO_IDENTIFY_TUTOR;
    }
    static get BANK_DETAILS_ALREADY_ADDED() {
        return BANK_DETAILS_ALREADY_ADDED;
    }

    static get TAB_UPDATE_DATA_SUCCESS() {
        return TAB_UPDATE_DATA_SUCCESS;
    }

    static get INSUFFICIENT_BANK_DETAILS() {
        return INSUFFICIENT_BANK_DETAILS;
    }
}
