import Common from './common';
import { DEVICE_REMOVED } from './errorMessages';

export default class UserDevice extends Common {
    static get DEFAULT_DELETED() {
        return DEVICE_REMOVED;
    }
}
