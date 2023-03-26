import Group from '../../utils/group';
const docMapping = {
    video: 'https://storage.googleapis.com/cp-assets-public-staging/assets/video.png',
    pdf: 'https://storage.googleapis.com/cp-assets-public-staging/assets/pdf.png',
    doc: 'https://storage.googleapis.com/cp-assets-public-staging/assets/document.png',
    image: 'https://storage.googleapis.com/cp-assets-public-staging/assets/image.png',
    file: 'https://storage.googleapis.com/cp-assets-public-staging/assets/document.png'
};

class messageUtil {
    // formatAttachments(messageObject) {
    //     const attachments = messageObject.attachments
    //         ? JSON.parse(messageObject.attachments)
    //         : [];

    //     attachments.forEach((attachment) => {
    //         // for (let [key, value] of Object.entries(attachment)) {
    //         //     console.log(key, value);
    //         //     value['icon'] = docMapping[value['fileType']];
    //         //     attachment[key] = value;
    //         // }
    //         attachment['icon'] =
    //             (attachment['fileType'] &&
    //                 docMapping[attachment['fileType']]) ||
    //             docMapping['file'];
    //     });
    //     messageObject.attachments = attachments;
    //     return messageObject;
    // }

    formatAttachments(messages) {
        messages.forEach((messageObject) => {
            const attachments = messageObject.attachments
                ? JSON.parse(messageObject.attachments)
                : [];
            messageObject.shareLinks = Group.msglinks(
                messageObject.id,
                messageObject.title,
                messageObject.description
            );
            attachments.forEach((attachment) => {
                // for (let [key, value] of Object.entries(attachment)) {
                //     console.log(key, value);
                //     value['icon'] = docMapping[value['fileType']];
                //     attachment[key] = value;
                // }
                attachment['icon'] =
                    (attachment['fileType'] &&
                        docMapping[attachment['fileType']]) ||
                    docMapping['file'];
            });
            messageObject.attachments = attachments;
            //return messageObject;
        });
        return messages;
    }
}

export default new messageUtil();
