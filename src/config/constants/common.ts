import {
    ADDED_SUCCESSFULLY,
    NOT_FOUND,
    SERVICE_NOT_WORKING,
    SUCCESS_200,
    BAD_INTERNAL_500,
    SUCCESSFULLY_CREATED,
    SUCCESSFULLY_UPDATED,
    SUCCESSFULLY_LISTED,
    SUCCESSFULLY_DELETED,
    UNLOCK_ALL_APP,
    LOGIN_SUCCESSFULL,
    DATA_NOT_FOUND,
    BAD_CLIENT_REQUEST_400,
    ACCESS_403,
    UPLOAD_SUCCESSFUL,
    CONTACT_NOT_FOUND,
    USER_LIST_FETCHED,
    BAD_INTERNAL_500_CHECK_INPUT,
    DATA_RECORDED_SUCESSFULLY,
    INTERNAL_SERVER_ERROR,
    SUCCESSFULLY_SAVED,
    ERROR_SAVING_DETAILS,
    ERROR_ADDING_NEW_CATEGORY,
    SUCCESSFULLY_FETCHED,
    UNABLE_TO_FETCH_DATA,
    UNABLE_TO_SAVE_PREFERENCES,
    INVALID_MOBILE_NUMBER,
    PLEASE_PROVIDE_ALL_FIELDS,
    PLEASE_PROVIDE_VALID_INPUTS,
    INVALID_CONTACTS,
    INVALID_NUMBER,
    SUCCESSFULLY_INSERTED,
    ERR_PROCESSING_REQ,
    INCORRECT_ACTION,
    CANNOT_ADD_YOURSELF,
    SUCCESS_SAVE_NEW_DETAILS,
    TABS_FETCH_SUCCESS,
    INVALID_USER_ORG,
    UNRECOGNIZED_TAB_CATEGORY,
    CARETAKER_ADDED_SUCCESSFULLY,
    CARETAKER_ALREAY_EXISTS,
    USER_REGISTERED_AS_PARENT_OR_STUDENT,
    NO_CARETAKER_TO_ADD,
    FAILED_TO_ADD_CARETAKERS,
    SEQUELIZE_DATABASE_ERROR,
    NO_DATA_TO_UPDATE,
    DUPLICATE_ELEMENT,
    FINGERPRINT_ID_REQUIRED,
    MAX_DEVICES_LOGIN_REACHED,
    ONLY_SINGLE_DEVICE_LOGIN_ALLOWED,
    INVALID_DEVICES_ALLOWED,
    ORG_ID_REQUIRED,
    SUCCESS_REGISTERED,
    FAILED_TO_ADD_USER,
    ERROR_EMAIL_UPDATE
} from './errorMessages';
export default class Common {
    static get FINGERPRINT_ID_REQUIRED() {
        return FINGERPRINT_ID_REQUIRED;
    }

    static get ORG_ID_REQUIRED() {
        return ORG_ID_REQUIRED;
    }

    static get DATA_ADDED_SUCCESS() {
        return ADDED_SUCCESSFULLY;
    }

    static get ERROR_NOT_FOUND() {
        return NOT_FOUND;
    }

    static get ERROR_SERVICE_NOT_WORKING() {
        return SERVICE_NOT_WORKING;
    }

    static get SUCCESS() {
        return SUCCESS_200;
    }

    static get ERROR_500() {
        return BAD_INTERNAL_500;
    }

    static get DEFAULT_CREATED() {
        return SUCCESSFULLY_CREATED;
    }

    static get DEFAULT_UPDATED() {
        return SUCCESSFULLY_UPDATED;
    }

    static get DEFAULT_LISTED() {
        return SUCCESSFULLY_LISTED;
    }

    static get DEFAULT_DELETED() {
        return SUCCESSFULLY_DELETED;
    }

    static get UNLOCK_ALL_APP() {
        return UNLOCK_ALL_APP;
    }

    static get SUCCESS_LOGIN() {
        return LOGIN_SUCCESSFULL;
    }

    static get DATA_NOT_FOUND() {
        return DATA_NOT_FOUND;
    }

    static get BAD_REQUEST() {
        return BAD_CLIENT_REQUEST_400;
    }

    static get ACCESS_403() {
        return ACCESS_403;
    }

    static get UPLOAD_SUCCESSFUL() {
        return UPLOAD_SUCCESSFUL;
    }

    static get CONTACT_NOT_FOUND() {
        return CONTACT_NOT_FOUND;
    }

    static get CONTACT_FETCH() {
        return USER_LIST_FETCHED;
    }

    static get DATA_NOT_RECORDED() {
        return BAD_INTERNAL_500_CHECK_INPUT;
    }

    static get DATA_RECORDED() {
        return DATA_RECORDED_SUCESSFULLY;
    }

    static get INTERNAL_SERVER() {
        return INTERNAL_SERVER_ERROR;
    }

    static get DEFAULT_SAVED() {
        return SUCCESSFULLY_SAVED;
    }

    static get ERROR_SAVING_DETAILS() {
        return ERROR_SAVING_DETAILS;
    }

    static get ERROR_SAVING_TUTOR_CATEGORY() {
        return ERROR_ADDING_NEW_CATEGORY;
    }

    static get SUCCESSFUL_FETCH() {
        return SUCCESSFULLY_FETCHED;
    }

    static get UNABLE_TO_FETCH() {
        return UNABLE_TO_FETCH_DATA;
    }

    static get UNABLE_SAVE_DETAILS() {
        return UNABLE_TO_SAVE_PREFERENCES;
    }

    static get INVALID_MOBILE_NUMBER() {
        return INVALID_MOBILE_NUMBER;
    }

    static get ALL_FIELDS_REQUIRED() {
        return PLEASE_PROVIDE_ALL_FIELDS;
    }

    static get INVALID_INPUTS() {
        return PLEASE_PROVIDE_VALID_INPUTS;
    }

    static get UPDATED_SUCCESSFULLY() {
        return SUCCESSFULLY_UPDATED;
    }

    static get INVALID_CONTACTS() {
        return INVALID_CONTACTS;
    }

    static get INVALID_NUMBER() {
        return INVALID_NUMBER;
    }

    static get SUCCESSFULLY_INSERTED() {
        return SUCCESSFULLY_INSERTED;
    }

    static get ERR_PROCESSING_REQ() {
        return ERR_PROCESSING_REQ;
    }

    static get INCORRECT_ACTION() {
        return INCORRECT_ACTION;
    }

    static get CANNOT_ADD_YOURSELF() {
        return CANNOT_ADD_YOURSELF;
    }

    static get SUCCESS_SAVE_NEW_DETAILS() {
        return SUCCESS_SAVE_NEW_DETAILS;
    }

    static get TABS_FETCH_SUCCESS() {
        return TABS_FETCH_SUCCESS;
    }

    static get INVALID_USER() {
        return INVALID_USER_ORG;
    }

    static get UNRECOGNIZED_TAB_CATEGORY() {
        return UNRECOGNIZED_TAB_CATEGORY;
    }

    static get CARETAKER_ADDED_SUCCESSFULLY() {
        return CARETAKER_ADDED_SUCCESSFULLY;
    }

    static get CARETAKER_ALREAY_EXISTS() {
        return CARETAKER_ALREAY_EXISTS;
    }

    static get USER_REGISTERED_AS_PARENT_OR_STUDENT() {
        return USER_REGISTERED_AS_PARENT_OR_STUDENT;
    }

    static get NO_CARETAKER_TO_ADD() {
        return NO_CARETAKER_TO_ADD;
    }

    static get FAILED_TO_ADD_CARETAKERS() {
        return FAILED_TO_ADD_CARETAKERS;
    }

    static get SEQUELIZE_DATABASE_ERROR() {
        return SEQUELIZE_DATABASE_ERROR;
    }

    static get NO_DATA_TO_UPDATE() {
        return NO_DATA_TO_UPDATE;
    }

    static get DUPLICATE_ELEMENT() {
        return DUPLICATE_ELEMENT;
    }

    static get SUCCESS_REGISTERED() {
        return SUCCESS_REGISTERED;
    }

    static get FAILED_TO_ADD_USER() {
        return FAILED_TO_ADD_USER;
    }

    static get ERROR_EMAIL_UPDATE() {
        return ERROR_EMAIL_UPDATE;
    }

    static get MAX_DEVICES_LOGIN_REACHED() {
        return MAX_DEVICES_LOGIN_REACHED;
    }

    static get ONLY_SINGLE_DEVICE_LOGIN_ALLOWED() {
        return ONLY_SINGLE_DEVICE_LOGIN_ALLOWED;
    }

    static get INVALID_DEVICES_ALLOWED() {
        return INVALID_DEVICES_ALLOWED;
    }

    static get SUBSCRIPTION_MAPPING() {
        return {
            Weekly: 7,
            Monthly: 30,
            '2 Months': 60,
            '3 Months': 90,
            '6 Months': 180,
            '1 Year': 365,
            '2 Weeks': 14
        };
    }

    static get CUSTOM_SUBSCRIPTION_MAPPING() {
        return {
            Months: 30,
            Days: 1
        };
    }

    static get DAYS_SUBSCRIPTION_MAPPING() {
        return {
            7: 'Weekly',
            30: 'Monthly',
            60: '2 Months',
            90: '3 Months',
            180: '6 Months',
            365: '1 Year',
            14: '2 Weeks'
        };
    }

    static get docMapping() {
        return {
            video: 'https://storage.googleapis.com/cp-assets-public-staging/assets/video.png',
            pdf: 'https://storage.googleapis.com/cp-assets-public-staging/assets/pdf.png',
            doc: 'https://storage.googleapis.com/cp-assets-public-staging/assets/document.png',
            image: 'https://storage.googleapis.com/cp-assets-public-staging/assets/image.png'
        };
    }

    static get EXTENSION_MAPPING() {
        return {
            'application/pdf': '.pdf',
            'image/png': '.png',
            'image/jpeg': '.jpeg',
            'image/jpg': '.jpg'
        };
    }
}
