import Common from './common';
import {
    CANNOT_EXTEND_EXPIRY,
    PREMIUM_DURATION_CHANGED,
    BAD_CLIENT_MISSING_USER_400,
    ACCESS_403_TUTORS_ONLY,
    USER_REGISTERED_AS_PARENT_STUDENT,
    TUTOR_WITH_NUMBER_ALREADY_EXISTS,
    DATA_FETCHED_SUCCESSFULLY,
    INVALID_STUDENT_COLLECTION,
    UNABLE_TO_INSERT_DATA,
    UNABLE_TO_INSERT_PARENTS_DATA,
    INVALID_STUDENT_NO_PARENTID,
    PARENTS_ADDED,
    TOO_LARGE_DATA,
    UNABLE_TO_IDENTIFY
} from './errorMessages';
export const mobilePattern = /^[9][1][6789]\d{9}$/;
export const mobilePatternInternational = /^(\+\d{1,7}[- ]?)?\d{5,20}$/;
export const mobilePatternWithoutCountryCode = /^[6789]\d{9}$/;
export default class Tutor extends Common {
    static get EXPIRY_EXTEND_ERROR_NO_TUTOR() {
        return CANNOT_EXTEND_EXPIRY;
    }
    static get PREMIUM_DATA_CAHANGE() {
        return PREMIUM_DURATION_CHANGED;
    }
    static get BAD_CLIENT_MISSING_USER_400() {
        return BAD_CLIENT_MISSING_USER_400;
    }
    static get ACCESS_403_TUTORS_ONLY() {
        return ACCESS_403_TUTORS_ONLY;
    }
    static get USER_REGISTERED_AS_STUDENT() {
        return USER_REGISTERED_AS_PARENT_STUDENT;
    }
    static get TUTOR_ALREADY_EXISTS() {
        return TUTOR_WITH_NUMBER_ALREADY_EXISTS;
    }
    static get DATA_FETCHED_SUCCESSFULLY() {
        return DATA_FETCHED_SUCCESSFULLY;
    }
    static get INVALID_STUDENT_COLLECTION_NO_PARENT_DETAILS() {
        return INVALID_STUDENT_COLLECTION;
    }
    static get UNABLE_TO_INSERT_USERS_DATA() {
        return UNABLE_TO_INSERT_DATA;
    }
    static get UNABLE_TO_INSERT_PARENTS_DATA() {
        return UNABLE_TO_INSERT_PARENTS_DATA;
    }
    static get INVALID_STUDENT_COLLECTION_NO_PARENTID_PROVIDED() {
        return INVALID_STUDENT_NO_PARENTID;
    }
    static get PARENTS_SUCCESSFULLY_ADDED_FOR_STUDENTS() {
        return PARENTS_ADDED;
    }
    static get UNABLE_TO_IDENTIFY() {
        return UNABLE_TO_IDENTIFY;
    }
    static get TOO_LARGE_DATA() {
        return TOO_LARGE_DATA;
    }
}
