const { MasterController, RequestBuilder, Joi } = require('base-packages');
import UpdateUser from '../services/update.user';

export default class UpdateUserDetails extends MasterController {
    static doc() {
        return {
            tags: ['UpdateUserDetails'],
            description: 'UpdateUserDetails',
            summary: 'updateUser'
        };
    }

    static validate() {
        const payload = new RequestBuilder();
        payload.addToBody(
            Joi.object().keys({
                email: Joi.string()
                    .custom((value, helper) => {
                        if (
                            !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                                value
                            )
                        ) {
                            return helper.message('Invalid Email');
                        }

                        return true;
                    })
                    .optional(),
                state: Joi.string().optional()
            })
        );
        return payload;
    }

    async controller() {
        try {
            return await UpdateUser.updateUser(this.data, this.req.user);
        } catch (error) {
            throw new Error(error);
        }
    }
}
