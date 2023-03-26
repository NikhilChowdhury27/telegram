import Common from './common';
import {
    DRAWER_NOT_WORKING,
    INVALID_FIELDS,
    ENTERED_WRONG_DOOR,
    NOT_TUTOR_OR_PREMIUM,
    ERROR_GENERATING_URL,
    TRY_WITH_DIFF_ORGCODE,
    INVALID_ORGCODE,
    INVALID_ORG,
    STORE_DEACTIVATED,
    NOTHING_TO_UPDATE,
    ORG_NOT_FOUND,
    FORCE_UPDATE_STATUS_FETCHED,
    DRAWER_NOT_FOUND,
    DRAWER_DETAILS_FETCHED,
    NO_DATA_FOUND_FOR_ORG,
    NOT_ENOUGH_COINS,
    FETCHED_HOME_TABS,
    COINS_REDEEMED_AND_LEFT,
    INVALID_WEB_ADDRESS,
    INVALID_EMAIL_ADDRESS,
    INPUT_FIELDS_MISSING,
    DEEPLINK_MISSING,
    APP_FOR_PLATFORM_NOT_PUBLISHED,
    ORG_CODE_MISSING,
    INVALID_USERID,
    FILTER_EMPTY,
    INVALID_COUNTRY_EXT
} from './errorMessages';

export default class Organization extends Common {
    static get DRAWER_400() {
        return DRAWER_NOT_WORKING;
    }
    static get HOMETABS_400() {
        return DRAWER_NOT_WORKING;
    }
    static get ORGMETA_400() {
        return DRAWER_NOT_WORKING;
    }
    static get HOMETABS_405() {
        return INVALID_FIELDS;
    }
    static get WRONG_DOOR() {
        return ENTERED_WRONG_DOOR;
    }
    static get NO_PREMIUM() {
        return NOT_TUTOR_OR_PREMIUM;
    }
    static get ERROR_REQUEST_REVIEW_URL() {
        return ERROR_GENERATING_URL;
    }
    static get ERROR_DUPLICATE_ORG_CODE() {
        return TRY_WITH_DIFF_ORGCODE;
    }

    static get DEFAULT_iOS_FIREBASE_ID() {
        return 'classsplus-2f8f2';
    }
    static get INVALID_ORGCODE() {
        return INVALID_ORGCODE;
    }
    static get APP_FOR_PLATFORM_NOT_PUBLISHED() {
        return APP_FOR_PLATFORM_NOT_PUBLISHED;
    }
    static get INVALID_ORGANIZATION() {
        return INVALID_ORG;
    }

    static get STORE_DEACTIVATED() {
        return STORE_DEACTIVATED;
    }
    static get NOTHING_TO_UPDATE() {
        return NOTHING_TO_UPDATE;
    }
    static get ORG_NOT_FOUND() {
        return ORG_NOT_FOUND;
    }
    static get FOCRE_STATUS_GET_SUCCESSFULLY() {
        return FORCE_UPDATE_STATUS_FETCHED;
    }
    static get DRAWER_NOT_FOUND() {
        return DRAWER_NOT_FOUND;
    }
    static get DRAWER_FOUND() {
        return DRAWER_DETAILS_FETCHED;
    }
    static get DRAWER_DATA_NOT_FOUND() {
        return NO_DATA_FOUND_FOR_ORG;
    }
    static get DRAWER_DATA_FOUND() {
        return DRAWER_DETAILS_FETCHED;
    }
    static get DRAWER_ICON_URL_NOT_FOUND() {
        return DRAWER_DETAILS_FETCHED;
    }
    static get COINS_NOT_ENOUGH_TO_REDEEM() {
        return NOT_ENOUGH_COINS;
    }
    static get COINS_UPDATE_SUCCESS() {
        return COINS_REDEEMED_AND_LEFT;
    }
    static get INVALID_USERID() {
        return INVALID_USERID;
    }
    static get FETCH_HOME_TAB() {
        return FETCHED_HOME_TABS;
    }

    static get INVALID_WEB_ADDRESS() {
        return INVALID_WEB_ADDRESS;
    }
    static get INPUT_FIELDS_MISSING() {
        return INPUT_FIELDS_MISSING;
    }
    static get INVALID_EMAIL_ADDRESS() {
        return INVALID_EMAIL_ADDRESS;
    }
    static get DEEPLINK_MISSING() {
        return DEEPLINK_MISSING;
    }
    static get ORG_CODE_MISSING() {
        return ORG_CODE_MISSING;
    }
    static get FILTER_EMPTY() {
        return FILTER_EMPTY;
    }
    static get INVALID_COUNTRY_EXT() {
        return INVALID_COUNTRY_EXT;
    }
    static get ACTIVE_COUNT_EXCEED() {
        return 'Only 5 tabs can be active';
    }
    static get TAB_NOT_PRESENT() {
        return 'Requested tab cannot be updated, as it is not present in db';
    }
    static get TAB_ALREADY_PRESENT() {
        return 'Tabs already inserted use update API';
    }
}
