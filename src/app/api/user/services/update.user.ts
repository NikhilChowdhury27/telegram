const { ResponseBuilder } = require('base-packages');
import CommonService from '../../../utils/common.service';
import UserRepository from '../../../repository/user.repository';
import Common from '../../../../config/constants/common';

class UpdateUser extends CommonService {
    async updateUser(payload: any, user: any) {
        try {
            const { email, state } = payload;
            let updateBody = {};
            if (email) {
                updateBody['email'] = email;
            }
            if (state) {
                updateBody['state'] = state;
            }
            const userdetails = await UserRepository.updateUser(
                { id: user.id },
                updateBody
            );

            return new ResponseBuilder(200, userdetails, Common.SUCCESS);
        } catch (error) {
            return new ResponseBuilder(
                400,
                {},
                'This email id is already registered with us. Please enter a different email id to proceed'
            );
        }
    }
}

export default new UpdateUser();
