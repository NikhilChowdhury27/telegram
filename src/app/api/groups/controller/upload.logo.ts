import { ERROR_500 } from '../../../../config/constants/errorMessages';
import GroupServiceV2 from '../services/group_V2';
const {
    MasterController,
    RequestBuilder,
    Joi,
    ResponseBuilder
} = require('base-packages');

export default class UploadImage extends MasterController {
    static doc() {
        return {
            tags: ['Group'],
            description: 'Upload Image',
            summary: 'Upload Image'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                fileExtension: Joi.string().required(),
                destination: Joi.string().required()
            })
        );
        return payload;
    }

    async controller() {
        try {
            console.log('in', this.data);
            return await GroupServiceV2.uploadImage(
                this.data.fileExtension,
                this.data.destination,
                this.data.user.id
            );
        } catch (e) {
            console.error('::Update group:: ', e);
            return new ResponseBuilder(500, {}, ERROR_500);
        }
    }
}
