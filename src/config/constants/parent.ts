import Common from './common';
import {
    REMOVED_PARENT_SUCCESSFULLY,
    UNABLE_TO_REMOVE_PARENT
} from './errorMessages';

export default class User extends Common {
    static get PARENT_REMOVED() {
        return REMOVED_PARENT_SUCCESSFULLY;
    }

    static get UNABLE_TO_REMOVE_PARENT() {
        return UNABLE_TO_REMOVE_PARENT;
    }
}
