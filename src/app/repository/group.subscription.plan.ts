import CommonRepository from '../utils/common.repository';
import GroupSubscriptionPlan from '../../models/GroupSubscriptionPlan';

export class GroupPlanRepository extends CommonRepository {
    async findPlanById(planId: number) {
        let data = await GroupSubscriptionPlan.findOne({
            where: {
                id: planId,
                isDeleted: false
            },
            raw: true
        });
        if (!data) {
            return null;
        }
        return data;
    }

    async findPlan(filter: any) {
        let data = await GroupSubscriptionPlan.findOne({
            where: filter,
            raw: true
        });
        return data;
    }
}

export default new GroupPlanRepository();
