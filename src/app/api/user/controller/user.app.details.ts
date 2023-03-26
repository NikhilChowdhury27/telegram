const { MasterController } = require('base-packages');
import Common from '../../../../config/constants/common';

export default class UserAppDetails extends MasterController {
    static doc() {
        return {
            tags: ['tutors'],
            description: 'create tuto',
            summary: 'create tuto'
        };
    }

    static secured() {
        return false;
    }

    async controller() {
        try {
            const appId = Number(process.env.apiId);
            const appHash = process.env.apiHash;
            return new this.ResponseBuilder(
                200,
                { appId, appHash },
                Common.SUCCESS
            );
        } catch (error) {
            if (error.sequelErrorCode) {
                return new this.ResponseBuilder(
                    400,
                    {},
                    error.message || Common.SEQUELIZE_DATABASE_ERROR
                );
            }
            if (error.response) {
                return error.response(400);
            }
            return new this.ResponseBuilder(500, {}, Common.ERROR_500);
        }
    }
}
