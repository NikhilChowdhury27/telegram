import Common from './common';
import {
    UNABLE_TO_ADD_OR_ORG_NOT_FOUND,
    SOME_STUDENTS_ADDED,
    STUDENTS_ADDED,
    PARENT_ALREADY_ADDED
} from './errorMessages';

export default class User extends Common {
    static get UNABLE_TO_ADD_STUDENTS_OR_ORGANISATION_NOT_FOUND() {
        return UNABLE_TO_ADD_OR_ORG_NOT_FOUND;
    }

    static get SOME_STUDENTS_ADDED_SUCCESSFULLY() {
        return SOME_STUDENTS_ADDED;
    }

    static get STUDENTS_ADDED_SUCCESSFULLY() {
        return STUDENTS_ADDED;
    }

    static get PARENT_ALREADY_ADDED() {
        return PARENT_ALREADY_ADDED;
    }
}
