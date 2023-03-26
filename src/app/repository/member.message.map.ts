import CommonRepository from '../utils/common.repository';
import MemberMessagepMap from '../../models/MemberMessageMap';
import { IQueryOption } from '../utils/common.interface';

export class MemberGroupMsgRepository extends CommonRepository {
    /**
     * @description get joined group by member
     * @param filter
     * @param projections
     * @param options
     * @returns
     */
    async getMessageMember(
        filter: any,
        projections: Array<string>,
        options?: IQueryOption,
        includes?: any
    ) {
        let query: any = {
            where: filter,
            raw: true,
            ...options,
            logging: true,
            includes
        };
        if (projections && projections.length) {
            query.attributes = projections;
        }
        return await MemberMessagepMap.findOne(query);
    }

    async updateMessageMemberStatus(member: any, status: string) {
        try {
            return await MemberMessagepMap.update(
                {
                    isAdded: status == 'success' ? 1 : 0,
                    membershipStatus: status
                },
                {
                    where: {
                        messageId: member.messageId,
                        memberId: member.memberId
                    }
                }
            );
        } catch (error) {
            throw Error(error);
        }
    }
}

export default new MemberGroupMsgRepository();
