import Common from './common';
import {
    USER_NOT_FOUND_ABORT,
    ONLY_STUDENT_CAN_BE_REMOVED_FROM_ORG,
    USER_REMOVED_FROM_ORG,
    USER_NOT_FOUND,
    SESSION_CREATED,
    SESSION_UPDATED,
    STUDENTS_SUBSCRIBED_CANNOT_DELETED,
    DELETED_SUCCESSFULLY,
    INVALID_USER_FILTER,
    USER_COORDINATE_ALREADY_ADDED,
    NO_CITY_STATE_INFO,
    USER_COORD_UPDATED,
    COORD_DETAILS_UPDATES,
    TUTOR_NOT_AVAILABLE,
    STUDENT_NOT_AVAILABLE,
    INVALID_TYPE_TOKEN,
    SUCCESSFULLY_ADDED,
    UNABLE_TO_RECOGNIZE_USER,
    YOU_ARE_NOT_ALLOWED,
    INVALID_USER,
    PARENT_LOGIN_NOT_ENABLED,
    INVALID_OTP_SESSIONID,
    INVALID_TYPE_USER,
    USER_ALREADY_EXISTS,
    NOT_ALLOWED_FOR_TUTORS,
    DATA_FETCHED_SUCCESSFULLY,
    USER_DETAILS_FETCHED_SUCCESSFULLY,
    UNRECOGNIZED_TYPE,
    SUCCESSFULLY_APPLIED_PROMOCODE,
    ALREADY_REGISTERED_PARENT,
    USER_ALREADY_REGISTERED_AS_TUTOR,
    EMAIL_ALREADY_EXISTS,
    NOT_ALLOWED_ON_WEB_FOR_LITE_USER,
    USER_NOT_REGISTERED,
    COINS_CREDITED,
    DEVICE_REGISTERED_SUCCESSFULLY,
    SESSIONID_IS_MISSING,
    MOBILE_NUMBER_DIGIT,
    INVALID_COUNTRY_CODE,
    ALREADY_REGISTERED,
    MOBILE_EMAIL_REQUIRED,
    EMAIL_REQUIRED,
    UPDATE_ERROR,
    FEILDS_MISSING,
    UNABLE_VERIFY_TRUE_CALLER,
    TRUE_CALLER_PROFILE_MISSING,
    REGISTERD_AS_PARENT,
    REGISTERED_AS_TUTOR,
    REGISTERD_AS_STUDENT,
    USER_NOT_FOUND_TRY_AGAIN,
    SUCCESS_ADD_NEW_DETAILS,
    NEW_NUMBER_ALREADY_EXISTS,
    OLD_NUMBER_DOES_NOT_EXISTS,
    SUCCESSFULLY_UPDATED_DATA,
    MOBILE_REQUIRED,
    ILLEGAL_COLLATION,
    USER_BLOCKED_ALREADY,
    MOBILE_ALREADY_EXISTS,
    USER_ALREADY_EXISTS_DIFF_TYPE
} from './errorMessages';

export default class User extends Common {
    static get USER_NOT_FOUND_ABORTING() {
        return USER_NOT_FOUND_ABORT;
    }
    static get ONLY_STUDENT_CAN_BE_REMOVED_FROM_ORG() {
        return ONLY_STUDENT_CAN_BE_REMOVED_FROM_ORG;
    }
    static get USER_REMOVED_FROM_ORG_SUCCESS() {
        return USER_REMOVED_FROM_ORG;
    }
    static get USER_NOT_FOUND() {
        return USER_NOT_FOUND;
    }

    static get SESSION_CREATED() {
        return SESSION_CREATED;
    }

    static get SESSION_UPDATED() {
        return SESSION_UPDATED;
    }

    static get STUDENT_SUBSCRIBED_CAN_NOT_BE_DELETED() {
        return STUDENTS_SUBSCRIBED_CANNOT_DELETED;
    }
    static get DELETED_SUCCESSFULLY() {
        return DELETED_SUCCESSFULLY;
    }
    static get INVALID_FILTER() {
        return INVALID_USER_FILTER;
    }

    static get ALREADY_ADDED() {
        return USER_COORDINATE_ALREADY_ADDED;
    }

    static get NO_INFO_FOUND() {
        return NO_CITY_STATE_INFO;
    }

    static get DATA_UPDATED() {
        return USER_COORD_UPDATED;
    }

    static get NOT_UPDATED() {
        return COORD_DETAILS_UPDATES;
    }

    static get TUTOR_NOT_AVAILABLE() {
        return TUTOR_NOT_AVAILABLE;
    }

    static get STUDENT_NOT_AVAILABLE() {
        return STUDENT_NOT_AVAILABLE;
    }

    static get INVALID_TYPE() {
        return INVALID_TYPE_TOKEN;
    }

    static get SUCCESS_ADDED() {
        return SUCCESSFULLY_ADDED;
    }

    static get UNABLE_TO_RECOGNIZE() {
        return UNABLE_TO_RECOGNIZE_USER;
    }

    static get ACTION_NOT_ALLOWED() {
        return YOU_ARE_NOT_ALLOWED;
    }
    static get INVALID_USER() {
        return INVALID_USER;
    }

    static get PARENT_LOGIN_OFF() {
        return PARENT_LOGIN_NOT_ENABLED;
    }
    static get INVALID_OTP_SESSION() {
        return INVALID_OTP_SESSIONID;
    }
    static get INVALID_USER_TYPE() {
        return INVALID_TYPE_USER;
    }
    static get USER_ALREADY_EXISTS() {
        return USER_ALREADY_EXISTS;
    }
    static get NOT_ALLOWED_FOR_TUTORS() {
        return NOT_ALLOWED_FOR_TUTORS;
    }
    static get DATA_FETCHED_SUCCESSFULLY() {
        return DATA_FETCHED_SUCCESSFULLY;
    }
    static get USER_DETAILS_FETCHED_SUCCESSFULLY() {
        return USER_DETAILS_FETCHED_SUCCESSFULLY;
    }
    static get UNRECOGNIZED_TYPE() {
        return UNRECOGNIZED_TYPE;
    }

    static get UPDATE_ERROR() {
        return UPDATE_ERROR;
    }

    static get APPLIED_PROMOCODE() {
        return SUCCESSFULLY_APPLIED_PROMOCODE;
    }
    static get FEILDS_MISSING() {
        return FEILDS_MISSING;
    }

    static get UNABLE_VERIFY_TRUE_CALLER() {
        return UNABLE_VERIFY_TRUE_CALLER;
    }

    static get TRUE_CALLER_PROFILE_MISSING() {
        return TRUE_CALLER_PROFILE_MISSING;
    }

    static get REGISTERED_AS_TUTOR() {
        return REGISTERED_AS_TUTOR;
    }

    static get REGISTERD_AS_PARENT() {
        return REGISTERD_AS_PARENT;
    }

    static get REGISTERD_AS_STUDENT() {
        return REGISTERD_AS_STUDENT;
    }

    static get USER_NOT_FOUND_TRY_AGAIN() {
        return USER_NOT_FOUND_TRY_AGAIN;
    }

    static get SUCCESS_SAVE_NEW_DETAILS() {
        return SUCCESS_ADD_NEW_DETAILS;
    }

    static get NEW_NUMBER_ALREADY_EXISTS() {
        return NEW_NUMBER_ALREADY_EXISTS;
    }

    static get OLD_NUMBER_DOES_NOT_EXISTS() {
        return OLD_NUMBER_DOES_NOT_EXISTS;
    }

    static get SUCCESSFULLY_UPDATED_DATA() {
        return SUCCESSFULLY_UPDATED_DATA;
    }
    static get REGISTERED_AS_PARENT() {
        return ALREADY_REGISTERED_PARENT;
    }
    static get USER_REGISTERED_AS_TUTOR() {
        return USER_ALREADY_REGISTERED_AS_TUTOR;
    }
    static get EMAIL_ALREADY_EXISTS() {
        return EMAIL_ALREADY_EXISTS;
    }
    static get NOT_ALLOWED_ON_WEB_FOR_LITE_USER() {
        return NOT_ALLOWED_ON_WEB_FOR_LITE_USER;
    }
    static get USER_NOT_REGISTERED() {
        return USER_NOT_REGISTERED;
    }
    static get COINS_CREDITED() {
        return COINS_CREDITED;
    }
    static get DEVICE_REGISTERED_SUCCESSFULLY() {
        return DEVICE_REGISTERED_SUCCESSFULLY;
    }
    static get SESSIONID_IS_MISSING() {
        return SESSIONID_IS_MISSING;
    }
    static get MOBILE_NUMBER_DIGIT() {
        return MOBILE_NUMBER_DIGIT;
    }
    static get INVALID_COUNTRY_CODE() {
        return INVALID_COUNTRY_CODE;
    }
    static get ALREADY_REGISTERED() {
        return ALREADY_REGISTERED;
    }
    static get MOBILE_EMAIL_REQUIRED() {
        return MOBILE_EMAIL_REQUIRED;
    }
    static get EMAIL_REQUIRED() {
        return EMAIL_REQUIRED;
    }
    static get MOBILE_REQUIRED() {
        return MOBILE_REQUIRED;
    }

    static get ILLEGAL_COLLATION() {
        return ILLEGAL_COLLATION;
    }
    static get USER_BLOCKED_ALREADY() {
        return USER_BLOCKED_ALREADY;
    }
    static get MOBILE_ALREADY_EXISTS() {
        return MOBILE_ALREADY_EXISTS;
    }
    static get USER_ALREADY_EXISTS_DIFF_TYPE() {
        return USER_ALREADY_EXISTS_DIFF_TYPE;
    }
}
