const { MasterController } = require('base-packages');
import { INTERNAL_SERVER_ERROR } from '../../../../config/constants/errorMessages';
import OnboardingDataService from '../services/onboarding.data';

export default class onboardingData extends MasterController {
    static doc() {
        return {
            tags: ['Auth'],
            description: 'Get Onboarding Data',
            summary: 'Get Onboarding Data'
        };
    }

    async controller() {
        try {
            const result = await OnboardingDataService.getData();
            return new this.ResponseBuilder(
                result.statusCode,
                result.data,
                result.message
            );
        } catch (error) {
            console.log('onboardingData error ::: ', error);
            return new this.ResponseBuilder(500, {}, INTERNAL_SERVER_ERROR);
        }
    }
}
