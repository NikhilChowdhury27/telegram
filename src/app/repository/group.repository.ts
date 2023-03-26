import CommonRepository from '../utils/common.repository';
import GroupDetails from '../../models/GroupDetail';
import { IGroup, IMember, IPricing } from '../api/groups/group.interface';
import { IQueryOption } from '../utils/common.interface';
import { sequelize } from '../../sequelize';
import MemberGroupMap from '../../models/MemberGroupMap';
import { QueryTypes, Sequelize } from 'sequelize';
export class GroupDetailsRepository extends CommonRepository {
    async addGroup(group: IGroup) {
        let groupData = new GroupDetails();
        groupData.groupName = group.groupName;
        groupData.about = group.about;
        groupData.subscriptionPlan = group.subscriptionPlan;
        groupData.createdAt = group.createdAt;
        groupData.updatedAt = group.updatedAt;
        groupData.createdBy = group.createdBy;
        groupData.channelId = group.channelId;
        groupData.channelHash = group.channelHash;
        groupData.isActive = 1;
        groupData.status = group.status;
        groupData.category = group.category;
        groupData.sessionId = group.sesssionId;
        groupData.inviteLink = group.inviteLink;
        if (group.type) {
            groupData.type = group.type;
        }

        if (group.joinedBy) {
            groupData.joinedBy = group.joinedBy;
        }
        groupData.logoUrl = group.logoUrl;
        if (group.removalBotStatus) {
            groupData.removalBotStatus = 1;
        }
        if (group.type) {
            groupData.type = group.type;
        }
        return await groupData.save();
    }

    async list(filter: any, options: IQueryOption) {
        return await GroupDetails.findAll({
            where: filter,
            ...options,
            raw: true
        });
    }

    async findGroupById(groupId: number) {
        let data: any = await sequelize.query(
            `SELECT * FROM group_details WHERE id=${groupId}`,
            {
                type: QueryTypes.SELECT
            }
        );
        // let data = await GroupDetails.findOne({
        //     where: {
        //         id: groupId,
        //         isActive: true
        //     },
        //     raw: true
        // });
        if (!data[0]) {
            return null;
        }
        // return JSON.parse(JSON.stringify(data));
        // TODO:
        return data[0];
    }

    async findGroupDetails(groupId: number, attributes: any) {
        let data = await GroupDetails.findOne({
            where: {
                id: groupId,
                isActive: true
            },
            attributes: attributes
        });
        return data;
    }

    async updateGroup(
        groupId: number,
        userId: number,
        data: IPricing[],
        groupName?: string,
        channelId?: number,
        channelHash?: string,
        status?: string,
        sessionId?: number,
        inviteLink?: string,
        logoUrl?: string,
        description?: string,
        approval?: number,
        formLink?: string
    ) {
        let updateObj = {
            subscriptionPlan: JSON.stringify(data),
            channelId: channelId,
            channelHash: channelHash,
            status: status,
            about: description
        };
        if (sessionId) {
            updateObj['sessionId'] = sessionId;
        }
        if (inviteLink) {
            updateObj['inviteLink'] = inviteLink;
        }
        if (groupName) {
            updateObj['groupName'] = groupName;
        }
        if (description) {
            updateObj['about'] = description;
        }
        if (logoUrl) {
            updateObj['logoUrl'] = logoUrl;
        }

        if (approval) {
            updateObj['conditionalApproval'] = 1;
        }
        if (formLink) {
            updateObj['formLink'] = formLink;
        }
        if (formLink == '') {
            updateObj['formLink'] = '';
        }
        return await GroupDetails.update(updateObj, {
            where: {
                id: groupId,
                createdBy: userId
            }
        });
    }

    async updateGroupByFiter(filter: any, data: any) {
        return await GroupDetails.update(data, {
            where: filter,
            returning: true
        });
    }

    async updateGroupStatus(groupId: number, userId: number, data: any) {
        return await GroupDetails.update(data, {
            where: {
                id: groupId,
                createdBy: userId
            }
        });
    }

    async findGroup(filter: any) {
        let data = await GroupDetails.findOne({
            where: filter
        });
        if (!data) {
            return null;
        }
        // return JSON.parse(JSON.stringify(data));
        // TODO:
        return data;
    }

    async joinGroup(member: IMember, amount: number) {
        const t = await sequelize.transaction();
        try {
            // Add members
            await MemberGroupMap.create(
                <any>{
                    ...member,
                    isAdded: 1
                },
                {
                    transaction: t
                }
            );
            await GroupDetails.update(
                {
                    memberCount: sequelize.literal('memberCount + 1'),
                    totalRevenue: sequelize.literal(`totalRevenue + ${amount}`)
                },
                {
                    where: {
                        id: member.groupId
                    },
                    transaction: t
                }
            );
            await t.commit();
        } catch (e) {
            console.error(e);
            await t.rollback();
        }
    }

    async updateGroupIncome(member: IMember, amount: number) {
        try {
            // Add members

            await GroupDetails.update(
                {
                    totalRevenue: sequelize.literal(`totalRevenue + ${amount}`)
                },
                {
                    where: {
                        id: member.groupId
                    }
                }
            );
        } catch (e) {
            console.error(e);
        }
    }

    async updateGroupIncomeFix(
        groupId: number,
        amount: number,
        members: number
    ) {
        try {
            // Add members

            await GroupDetails.update(
                {
                    totalRevenue: sequelize.literal(`totalRevenue + ${amount}`),
                    memberCount: sequelize.literal(`memberCount + ${members}`)
                },
                {
                    where: {
                        id: groupId
                    }
                }
            );
        } catch (e) {
            console.error(e);
        }
    }

    async allGroups(userId) {
        return GroupDetails.findAll({
            where: {
                createdBy: userId
            },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('totalRevenue')), 'total']
            ],
            raw: true
        });
    }

    async allCreatedGroupIds(userId) {
        return GroupDetails.findAll({
            where: {
                createdBy: userId
            },
            attributes: ['id'],
            raw: true
        });
    }
}

export default new GroupDetailsRepository();
