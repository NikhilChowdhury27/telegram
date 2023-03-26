import { sequelize } from '../../sequelize';
import { IAllListMember } from '../api/members/member.interface';

class StatsRepository {
    async allMembers(filter: IAllListMember) {
        let query;
        if (!filter.groupIds.length && !filter.messageIds.length) {
            return [];
        }
        if (!filter.groupIds.length) {
            query = `SELECT mmm.id, mmm.createdAt as joinedDate, NULL as currentPlan, mmm.memberId, mmm.messageId as entityId, lmd.lockedMessage as groupName, 2 as entityType, lmd.revenue, u.name as name
			FROM member_message_map AS mmm
			INNER JOIN locked_message_details as lmd ON lmd.id = mmm.messageId
			INNER JOIN users AS u ON u.id=mmm.memberId
			WHERE mmm.messageId IN (${filter.messageIds.join()}) AND mmm.isAdded = 1
			ORDER BY joinedDate DESC LIMIT ${filter.limit} OFFSET ${filter.offset}
			`;
        } else if (!filter.messageIds.length) {
            query = `SELECT mgm.id, mgm.joinedDate, p.currentPlan, mgm.memberId, mgm.groupId as entityId, mgm.groupName as groupName, 1 as entityType, 0 AS revenue, u.name as name, p.amount as userrevenue
			FROM member_group_map as mgm
			INNER JOIN users AS u ON u.id=mgm.memberId
			INNER JOIN payment_table AS p ON p.groupId=mgm.groupId AND p.buyerId=mgm.memberId
			WHERE mgm.groupId IN (${filter.groupIds.join()}) and p.status='Success'
			ORDER BY p.createdAt DESC
			LIMIT ${filter.limit}
			OFFSET ${filter.offset}
		`;
        } else {
            query = `SELECT mgm.id, mgm.joinedDate, mgm.currentPlan, mgm.memberId, mgm.groupId as entityId, mgm.groupName as groupName, 1 as entityType, 0 AS revenue, u.name as name
				FROM member_group_map as mgm
				INNER JOIN users AS u ON u.id=mgm.memberId
				WHERE mgm.groupId IN (${filter.groupIds.join()})
				UNION ALL
				SELECT mmm.id, mmm.createdAt as joinedDate, NULL as currentPlan, mmm.memberId, mmm.messageId as entityId, lmd.lockedMessage as groupName, 2 as entityType, lmd.revenue, u.name as name
				FROM member_message_map AS mmm
				INNER JOIN locked_message_details as lmd ON lmd.id = mmm.messageId
				INNER JOIN users AS u ON u.id=mmm.memberId
				WHERE mmm.messageId IN (${filter.messageIds.join()}) AND mmm.isAdded = 1
				ORDER BY joinedDate DESC
				LIMIT ${filter.limit}
				OFFSET ${filter.offset}
			`;
        }
        return sequelize.query(query, {
            raw: true,
            nest: true,
            logging: console.log
        });
    }
}

export default new StatsRepository();
