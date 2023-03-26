import CommonRepository from '../utils/common.repository';
import MemberGroupMap from '../../models/MemberGroupMap';
// import User from '../repository/user.repository';
import { IQueryOption } from '../utils/common.interface';
import { Sequelize, Op, QueryTypes } from 'sequelize';
import { IAllListMember, IListMember } from '../api/members/member.interface';
// import User from '../../models/User';
// import GroupDetails from '../../models/GroupDetail';
import { sequelize } from '../../sequelize';
import * as moment from 'moment';
// import User from 'src/models/User';
// import { users } from 'telegram/client';

export class MemberGroupMapRepository extends CommonRepository {
    /**
     * @description get joined group by member
     * @param filter
     * @param projections
     * @param options
     * @returns
     */
    async getJoinedGroup(
        filter: any,
        projections: Array<string>,
        options?: IQueryOption
    ) {
        let query: any = {
            where: filter,
            ...options
        };
        if (projections && projections.length) {
            query.attributes = projections;
        }
        return await MemberGroupMap.findAll(query);
    }

    /**
     * @description check if member has already joined group
     * @param groupId
     * @param memberId
     * @returns
     */
    async hasMemberJoinedGroup(groupId: number, memberId: number) {
        const data = await MemberGroupMap.findAll({
            where: {
                groupId: groupId,
                memberId: memberId,
                isActive: true
            },
            limit: 1,
            attributes: ['id']
        });

        return data && data.length;
    }

    async hasMemberJoinedGroup2(groupId: number, memberId: number) {
        const data = await MemberGroupMap.findAll({
            where: {
                groupId: groupId,
                memberId: memberId
            },
            limit: 1
        });

        return data;
    }

    async hasMemberJoinedGroupAndAdded(groupId: number, memberId: number) {
        const data = await MemberGroupMap.findOne({
            where: {
                groupId: groupId,
                memberId: memberId
            }
            // limit: 1
            // attributes: ['id']
        });

        return data;
    }

    async getMemberDetails(groupId: number, memberId: number, attributes: any) {
        const data = await MemberGroupMap.findOne({
            where: {
                groupId: groupId,
                memberId: memberId
            },
            attributes: attributes
        });

        return data;
    }

    async membersCount(groupId: number) {
        const data = await MemberGroupMap.count({
            where: {
                groupId: groupId
            },
            attributes: [
                'isActive',
                [Sequelize.fn('COUNT', Sequelize.col('isActive')), 'count']
            ],
            group: 'isActive'
        });

        let resp = {
            active: 0,
            inActive: 0
        };
        (data || []).forEach((e) => {
            if (e.isActive) {
                resp.active = e.count;
            } else {
                resp.inActive = e.count;
            }
        });
        return resp;
    }

    async list(filter: IListMember) {
        let data: any = await sequelize.query(
            {
                query: `
		SELECT m.id, m.isActive, m.joinedDate, m.currentPlan,
		u.name, u.mobile, m.memberId as userId, p.amount as userrevenue
		FROM member_group_map AS m
		INNER JOIN users as u ON u.id=m.memberId
		INNER JOIN payment_table AS p ON p.groupId=m.groupId AND p.buyerId=m.memberId
		WHERE m.groupId = ? AND p.status='Success'
		ORDER BY p.createdAt DESC
		LIMIT ? OFFSET ?
		`,
                values: [filter.groupId, filter.limit, filter.offset]
            },
            {
                raw: true,
                nest: true
            }
        );
        for (let d of data) {
            d.user = {
                name: d.name,
                mobile: d.mobile,
                userId: d.userId
            };
            // if (d.currentPlan) {
            // let tmp = JSON.parse(d.currentPlan);
            // if (tmp.accessPrice) {
            //     d.revenue = tmp.accessPrice;
            // } else if (tmp.paymentPeriod && tmp.paymentPeriod.price) {
            //     d.revenue = tmp.paymentPeriod.price;
            // } else {
            //     d.revenue = 0;
            // }
            // d.revenue = tmp.price - tmp.discount || 0;
            d.revenue = d.userrevenue;
            // }
        }
        return data;
    }

    async membersCountAboutToEx(dates) {
        const count = await MemberGroupMap.count({
            where: {
                expiryDate: dates,
                lastCronRun: { [Op.not]: moment().format('YYYY-MM-DD') },
                isActive: true
            }
        });
        console.log(' member count close to expiry', count);
        return count;
    }

    async membersCountExpired() {
        const count = await MemberGroupMap.count({
            where: {
                expiryDate: {
                    $lt: moment().format('YYYY-MM-DD')
                },
                isActive: true
            }
        });
        return count;
    }

    async membersExpired(payload: any) {
        const expiredUsers: any = await sequelize.query(
            `
				SELECT DISTINCT(mgm.id) as mgmId, mgm.memberId, u.telegramUserId, u.whatsappStatus, mgm.memberId,  mgm.joinedBy , u.email,  mgm.inviteLink ,  u.mobile, u.name as userName, ad.name as adminName,
				gd.groupName as channelName,gd.id as groupId ,gd.isReminderEnabled,   gd.channelId
				from member_group_map mgm 
				INNER JOIN users u ON u.id = mgm.memberId 
				INNER JOIN group_details gd ON gd.id = mgm.groupId
				INNER JOIN users ad ON ad.id = gd.createdBy
				INNER JOIN group_bot_map gbm ON gbm.groupId = mgm.groupId
				WHERE DATE(mgm.expiryDate) < CURDATE() AND mgm.isActive=1
				AND gbm.botTokenId = ${payload.botToken} 
				AND gd.type IN ('telegramExisting', 'telegramChannel')
				LIMIT ${payload.limit}
		`,
            {
                raw: true,
                nest: true
            }
        );
        return expiredUsers;
    }

    async membersAboutToEx(dates, offset, limit) {
        let data: any = await sequelize.query(
            `SELECT gd.groupName, m.expiryDate, m.groupId,m.lastCronRun,m.expiryReminderStatus, cd.name as creatorName,
			u.name, u.mobile, u.whatsappStatus, m.memberId as userId, u.email, gd.type
			FROM member_group_map AS m
			INNER JOIN users as u ON u.id=m.memberId
			INNER JOIN group_details gd ON gd.id = m.groupId
			INNER JOIN users cd on cd.id = gd.createdBy
			WHERE m.expiryDate in (:dateRange) 
			AND m.isActive=1 AND 
			(m.lastCronRun NOT IN ('${moment().format('YYYY-MM-DD')}') 
			OR m.lastCronRun IS NULL)  AND gd.isReminderEnabled =1
			LIMIT :limit OFFSET :offset 
		`,
            // AND m.groupId NOT IN (584, 762, 788,904, 1082)
            {
                logging: true,
                type: QueryTypes.SELECT,
                replacements: {
                    dateRange: dates,
                    limit: limit,
                    offset: offset
                },
                raw: true,
                nest: true
            }
        );
        console.log('membersAboutToEx', data.length);
        return data;
    }

    async listAll(filter: IAllListMember) {
        let data: any = await sequelize.query(
            {
                query: `
		SELECT m.id,
		m.isActive,
		m.joinedDate,
		m.currentPlan,
		m.memberId,
		m.groupId,
		m.groupName,
		u.name
		FROM member_group_map AS m
		INNER JOIN users AS u ON u.id=m.memberId
		WHERE m.groupId IN (?)
		LIMIT ? OFFSET ?
		`,
                values: [filter.groupIds, filter.limit, filter.offset]
            },
            {
                raw: true,
                nest: true
            }
        );
        for (let d of data) {
            d.user = {
                name: d.name
            };
        }
        return data;
        // return MemberGroupMap.findAll({
        // 	where: {
        // 		groupId: filter.groupIds
        // 	},
        // 	include: [
        // 		{
        // 			model: User,
        // 			attributes: ['name']
        // 		}
        // 	],
        // 	limit: filter.limit,
        // 	offset: filter.offset,
        // 	attributes: [
        // 		'id',
        // 		'isActive',
        // 		'joinedDate',
        // 		'currentPlan',
        // 		'memberId',
        // 		'groupId',
        // 		'groupName'
        // 	]
        // });
    }

    async listAll2(filter: IAllListMember) {
        let data: any = await sequelize.query(
            {
                query: `
			SELECT m.id,
			m.isActive,
			m.joinedDate,
			m.currentPlan,
			m.memberId,
			m.groupId,
			m.groupName,
			u.name,
			p.amount as as userRevenue
			FROM member_group_map AS m
			INNER JOIN users AS u ON u.id=m.memberId
			INNER JOIN payment_table AS p ON p.groupId=m.groupId
			WHERE m.groupId IN (?) AND p.status='Success'
		LIMIT ? OFFSET ?
		`,
                values: [filter.groupIds, filter.limit, filter.offset]
            },
            {
                raw: true,
                nest: true
            }
        );
        for (let d of data) {
            d.user = {
                name: d.name
            };
        }
        return data;
        // return MemberGroupMap.findAll({
        // 	where: {
        // 		groupId: filter.groupIds
        // 	},
        // 	include: [
        // 		{
        // 			model: User,
        // 			attributes: ['name']
        // 		}
        // 	],
        // 	limit: filter.limit,
        // 	offset: filter.offset,
        // 	attributes: [
        // 		'id',
        // 		'isActive',
        // 		'joinedDate',
        // 		'currentPlan',
        // 		'memberId',
        // 		'groupId',
        // 		'groupName'
        // 	]
        // });
    }

    // async getJoinedData(filter, projection) {
    // 	try {
    // 		const include = [];
    // 		include.push({
    // 			model: User,
    // 			attributes: ['telegramAccessHash', 'telegramUserId'],
    // 			required: false
    // 		});
    // 		include.push({
    // 			model: GroupDetails,
    // 			attributes: ['channelHash', 'channelId'],
    // 			required: false
    // 		});

    // 		return await MemberGroupMap.findAll({
    // 			where: filter,
    // 			include,
    // 			attributes: projection,
    // 			logging: console.log
    // 		});
    // 	} catch (error) {
    // 		throw Error(error);
    // 	}
    // }

    async updateActiveStatus(filter, activeStatus: number) {
        try {
            return await MemberGroupMap.update(
                {
                    isActive: activeStatus,
                    joinedBy: null,
                    isAdded: activeStatus,
                    memberStatus: 'expired',
                    status: 'success',
                    isLeft: 0
                },
                { where: filter }
            );
        } catch (error) {
            throw Error(error);
        }
    }

    async updateGroupMemberStatus(member: any, status: string) {
        try {
            const data = {
                isActive: status == 'success' ? 1 : 0,
                isAdded: 1,
                expiryDate: member.expiryDate || null,
                expiryTimestamp: member.expiryTimestamp || null,
                status
            };
            if (member && member.inviteLink) {
                data['inviteLink'] = member.inviteLink;
            }
            if (member && member.inviteLink == '') {
                data['inviteLink'] = member.inviteLink;
            }
            if (member && member.currentPlan) {
                data['currentPlan'] = member.currentPlan;
            }
            if (member && member.paymentId) {
                data['paymentId'] = member.paymentId;
            }
            if (member && member.memberStatus) {
                data['memberStatus'] = member.memberStatus;
            }
            if (member && member.joinedBy) {
                data['joinedBy'] = member.joinedBy;
            }
            if (member && member.planId) {
                data['planId'] = member.planId;
            }
            return await MemberGroupMap.update(data, {
                where: {
                    groupId: member.groupId,
                    memberId: member.memberId
                }
            });
        } catch (error) {
            throw Error(error);
        }
    }

    async updateGroupMemberdata(filter: any, data: any) {
        try {
            const result = await MemberGroupMap.update(data, {
                where: filter,
                logging: true
            });
            return result;
        } catch (error) {
            throw Error(error);
        }
    }

    async updateGroupMemberCronStatus(
        memberId: number,
        groupId: number,
        cronStatus: string
    ) {
        try {
            return await MemberGroupMap.update(
                {
                    lastCronRun: cronStatus === 'success' ? new Date() : null,
                    expiryReminderStatus: cronStatus
                },
                {
                    where: {
                        groupId: groupId,
                        memberId: memberId
                    }
                }
            );
        } catch (error) {
            throw Error(error);
        }
    }

    async updateGroupMemberInfo(
        memberId: number,
        groupId: number,
        payload: any
    ) {
        try {
            return await MemberGroupMap.update(payload, {
                where: {
                    groupId,
                    memberId
                }
            });
        } catch (error) {
            throw Error(error);
        }
    }

    async findOrCreateMemberGroupMap(payload: any) {
        const [memberGroupMap, created] = await MemberGroupMap.findOrCreate({
            defaults: {
                memberId: payload.memberId,
                groupId: payload.groupId,
                paymentId: payload.paymentId,
                expiryTimestamp: payload.expiryTimestamp,
                currentPlan: payload.currentPlan,
                isAdded: payload.isAdded,
                status: payload.status,
                expiryDate: payload.expiryDate,
                groupName: payload.groupName,
                joinedDate: payload.joinedDate,
                memberStatus: 'renewed',
                inviteLink: null
            },

            where: {
                memberId: payload.memberId,
                groupId: payload.groupId
            }
        });

        return {
            memberGroupMap,
            created
        };
    }
}

export default new MemberGroupMapRepository();
