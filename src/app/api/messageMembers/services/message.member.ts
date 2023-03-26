import MemberMsgMapRepository from '../../../repository/member.message.map';
import CommonService from '../../../utils/common.service';
const { ResponseBuilder } = require('base-packages');
import { DATA_FETCHED_SUCCESSFULLY } from '../../../../config/constants/errorMessages';
// import User from '../../../../models/User';
// import PaymentTable from '../../../../models/PaymentTable';
import { sequelize } from '../../../../sequelize';
import { QueryTypes } from 'sequelize';
class MemberService extends CommonService {
    async checkMessageMembership(
        userId,
        messageId,
        options = {},
        includes = {}
    ) {
        const filter = {
            messageId,
            memberId: userId,
            ...options
        };
        const projection = ['id', 'isAdded', 'errorMsg'];
        const result = await MemberMsgMapRepository.getMessageMember(
            filter,
            projection,
            includes
        );
        return new ResponseBuilder(200, result, DATA_FETCHED_SUCCESSFULLY);
    }

    async listMembers(messageId, limit = 100, offset = 0) {
        // const filter = {
        //     messageId
        // };
        // const options = {
        //     limit,
        //     offset
        // };
        // const projections = ['id', 'messageId', 'paymentId'];
        // const includes = {
        //     include: [
        //         {
        //             model: User,
        //             attributes: ['name', ['id', 'userId'], 'mobile']
        //         },
        //         {
        //             model: PaymentTable
        // 			as:
        //         }
        //     ]
        // };
        // return MemberMsgMapRepository.getMessageMember(
        //     filter,
        //     projections,
        //     options,
        //     includes
        // );
        const members = await sequelize.query(
            `select u.name, u.mobile, u.email, p.amount as revenue, mmp.createdAt as joinedDate, lmd.title as groupName 
			 from member_message_map mmp
			 join locked_message_details lmd on lmd.id = mmp.messageId 
		join users u on u.id = mmp.memberId
		join payment_table p on p.id=mmp.paymentId
		where mmp.messageId=${messageId} limit ${limit} offset ${offset}; `,
            { type: QueryTypes.SELECT }
        );
        const aggregateData = await sequelize.query(
            `select count(mmp.id) as memberCount, sum(p.amount) as totalRevenue from member_message_map mmp
		join users u on u.id = mmp.memberId
		join payment_table p on p.id=mmp.paymentId
		where mmp.messageId=${messageId};`,
            { type: QueryTypes.SELECT }
        );
        members.forEach((member) => {
            member['user'] = {
                name: member['name']
            };
        });

        const data = {
            totalRevenue: aggregateData[0]['totalRevenue'],
            totalMembers: aggregateData[0]['memberCount'],
            members
        };
        return new ResponseBuilder(200, data, 'Member list');
    }
}

export default new MemberService();
