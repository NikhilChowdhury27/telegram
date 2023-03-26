import CommonRepository from '../utils/common.repository';
import BankDetail from '../../models/BankDetail';
export class TutorBankDetailRepository extends CommonRepository {
    async getTutorBankDetailByTutorId(tutorId: number) {
        const tutorDetails = await BankDetail.findOne({
            where: {
                userId: tutorId,
                isActive: true,
                isDeleted: false,
                isPrimary: true
            },
            raw: true
        });
        return tutorDetails;
    }
}

export default new TutorBankDetailRepository();
