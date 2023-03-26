import UserRepository from '../../../repository/user.repository';
import CommonService from '../../../utils/common.service';
import _ from 'underscore';

class updateUserSession extends CommonService {
    async service(payload: any) {
        const { session, telegramUserId, telegramAccessHash, user } = payload;
        const filter = { id: user.id };
        const updateData = {
            session: session,
            telegramUserId: telegramUserId,
            telegramAccessHash: telegramAccessHash
        };
        const result = await UserRepository.updateUser(filter, updateData);
        return result;
    }
}

export default new updateUserSession();
