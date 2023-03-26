import publishMessage from '../../api/messages/controller/add.message';
import getMessages from '../../api/messages/controller/get.message';
import getMessagesUnauth from '../../api/messages/controller/get.message.unauth';

import isAuthenticated from '../../../middlewares/isAuthenticated';
import editMessage from '../../api/messages/controller/edit.message';
import messageMembers from '../../api/messageMembers/controller/list.message.members';
const multer = require('multer');

const upload = multer();

module.exports = function (app, path = '') {
    publishMessage.post(app, path + '/message', [upload.any(), isAuthenticated]);
    getMessages.get(app, path + '/message/:messageId?', [isAuthenticated]); // pass groupId in queryParams to get details of one group
    getMessagesUnauth.get(app, path + '/messageUnauth/:messageId'); // pass groupId in queryParams to get details of one group
    editMessage.put(app, path + '/message/:messageId', [isAuthenticated]);
    messageMembers.get(app, path + '/message/:messageId/members', [
        isAuthenticated
    ]);
};
