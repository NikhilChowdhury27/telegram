import UserRepository from '../../../repository/user.repository';
import CommonService from '../../../utils/common.service';
import { SUCCESS_200 } from '../../../../config/constants/errorMessages';

class AuthService extends CommonService {
    async service(mobile) {
        try {
            const userRes = await UserRepository.findUser({ mobile: mobile }, [
                'telegramUsername'
            ]);
            if (userRes && userRes.length > 0) {
                return {
                    statusCode: 200,
                    message: SUCCESS_200,
                    data: {
                        isUserExists: 1,
                        isHandleExist: userRes[0].telegramUsername ? 1 : 0
                    }
                };
            }
            return {
                statusCode: 200,
                message: SUCCESS_200,
                data: {
                    isUserExists: 0,
                    isHandleExists: 0
                }
            };
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new AuthService();
