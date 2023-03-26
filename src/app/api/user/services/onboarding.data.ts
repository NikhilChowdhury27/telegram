import CommonService from '../../../utils/common.service';
import { SUCCESS_200 } from '../../../../config/constants/errorMessages';
class OnboardingDataService extends CommonService {
    async getData() {
        try {
            let result = [
                {
                    text: 'Create paid links to monetize your knowledge',
                    imageUrl:
                        'https://storage.googleapis.com/cp-prod-assets-public-as-sth1-gcs-w37fpj/fanKonnect/onboardingImages/Frame1116599734.png'
                },
                {
                    text: 'Share with your fans using different channels',
                    imageUrl:
                        'https://storage.googleapis.com/cp-prod-assets-public-as-sth1-gcs-w37fpj/fanKonnect/onboardingImages/Frame1116599733.png'
                },
                {
                    text: 'Earn instantly without any hassle',
                    imageUrl:
                        'https://storage.googleapis.com/cp-prod-assets-public-as-sth1-gcs-w37fpj/fanKonnect/onboardingImages/Frame1116599732.png'
                }
            ];
            return {
                statusCode: 200,
                message: SUCCESS_200,
                data: result
            };
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new OnboardingDataService();
