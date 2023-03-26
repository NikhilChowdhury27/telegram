import GroupDetailsRepository from '../../../repository/group.repository';
import CommonService from '../../../utils/common.service';
import { IAllListMember } from '../../members/member.interface';
const { ResponseBuilder } = require('base-packages');
import _ from 'underscore';
import {
    BAD_CLIENT_MISSING_CLIENT_400,
    SUCCESSFULLY_LISTED,
    SUCCESSFULLY_SAVED
} from '../../../../config/constants/errorMessages';
import messageRepository from '../../../repository/message.repository';
import statsRepository from '../../../repository/stats.repository';
import ReportRequest from '../../../../models/ReportRequest';
import { sequelizeRead } from '../../../../sequelize';
import { QueryTypes } from 'sequelize';

import { parse } from 'json2csv';
import { sendMailGunMail } from '../../../../app/utils/mailgun.manual';
import * as moment from 'moment';
import BankDetailRead from '../../../../modelsRead/BankDetail';
import PaymentTableRead from '../../../../modelsRead/PaymentTable';

class StatsService extends CommonService {
    async myEarnings(filter: IAllListMember, userId) {
        let statDetails = {
            members: [],
            totalRevenue: 0
        };
        filter.userId = userId;
        filter.limit = filter.limit ? Number(filter.limit) : 100;
        filter.offset = filter.offset ? Number(filter.offset) : 0;
        let [groupDetails, groupIds, messageDetails, messageIds]: any =
            await Promise.all([
                GroupDetailsRepository.allGroups(filter.userId),
                GroupDetailsRepository.allCreatedGroupIds(filter.userId),
                messageRepository.totalRevenue(filter.userId),
                messageRepository.allCreatedLockedMessages(filter.userId)
            ]);
        statDetails.totalRevenue =
            groupDetails &&
            groupDetails.length &&
            Number(`${groupDetails[0].total || 0}`);
        statDetails.totalRevenue +=
            messageDetails &&
            messageDetails.length &&
            Number(`${messageDetails[0].total || 0}`);
        filter.groupIds = _.pluck(groupIds || [], 'id');
        filter.messageIds = _.pluck(messageIds || [], 'id');
        let membsers = await statsRepository.allMembers(filter);
        for (let m of membsers) {
            m.user = {
                name: m.name
            };
            if (m.entityType == 2) {
                continue;
            }
            // let tmp = JSON.parse(m.currentPlan);
            // if (tmp.accessPrice) m.revenue = tmp.accessPrice;
            // else if (tmp.paymentPeriod && tmp.paymentPeriod.price) m.revenue = tmp.paymentPeriod.price;
            // else m.revenue = 0;
            // m.revenue = tmp.price - tmp.discount || 0;
            m.revenue = m.userrevenue;
        }
        statDetails.members = membsers;
        return new ResponseBuilder(200, statDetails, SUCCESSFULLY_LISTED);
    }

    async createReport(payload: any) {
        try {
            await ReportRequest.create({
                type: payload.type,
                channel: payload.channel || null,
                period: payload.period || null,
                userId: payload.user.id,
                status: 'queued'
            });
            return new ResponseBuilder(
                200,
                { message: SUCCESSFULLY_SAVED },
                BAD_CLIENT_MISSING_CLIENT_400
            );
        } catch (err) {
            return new ResponseBuilder(
                400,
                { message: err.message },
                BAD_CLIENT_MISSING_CLIENT_400
            );
        }
    }

    async reportCron() {
        try {
            const pendingReports: any = await sequelizeRead.query(
                `
				SELECT groupName, rr.type, rr.channel, rr.period, rr.userId, rr.id,rr.createdAt, c.email FROM report_request rr LEFT JOIN group_details gd ON gd.id=rr.channel JOIN users c ON c.id=rr.userId WHERE rr.status='queued' LIMIT 10`,
                {
                    type: QueryTypes.SELECT,
                    raw: true
                }
            );
            console.log(pendingReports);
            for (let report of pendingReports) {
                let data = [];
                if (report.type == 'active') {
                    const activeMemebrs = await sequelizeRead.query(
                        `
                    	SELECT u.name , u.id,  u.mobile, u.email , mgm.inviteLink, mgm.joinedBy, mgm.currentPlan, mgm.isLeft , mgm.status 
						  FROM member_group_map mgm 
						 JOIN users u ON u.id=mgm.memberId  WHERE mgm.status <> 'expired' AND
						   mgm.groupId = ${report.channel};`,
                        {
                            type: QueryTypes.SELECT,
                            raw: true
                        }
                    );

                    for (let i = 0; i < activeMemebrs.length; i++) {
                        const latestPayment = await PaymentTableRead.findOne({
                            where: {
                                buyerId: activeMemebrs[i]['id'],
                                groupId: report.channel
                            },
                            order: [['createdAt', 'desc']],
                            raw: true
                        });
                        if (!latestPayment) {
                            continue;
                        }
                        const memebrStatus =
                            activeMemebrs[i]['status'] === 'pending'
                                ? 'Not Joined'
                                : activeMemebrs[i]['isLeft']
                                ? 'Left'
                                : 'Joined';
                        const plan =
                            activeMemebrs[i]['currentPlan'] !== '' &&
                            JSON.parse(activeMemebrs[i]['currentPlan']);
                        const selectedPeriod = plan
                            ? plan['selectedPeriod'] === 'Custom Period'
                                ? `${plan['customValue']} ${plan['customType']}`
                                : plan['selectedPeriod']
                            : '';
                        data.push({
                            Name: activeMemebrs[i]['name'],
                            Email: activeMemebrs[i]['email'],
                            Mobile: activeMemebrs[i]['mobile'],
                            'Invite Link': activeMemebrs[i]['inviteLink'],
                            'Current Status': memebrStatus,
                            Renewed: latestPayment.renewed ? 'Y' : 'N',
                            Amount: latestPayment.amount,
                            'Coupon Discount': latestPayment.couponDiscount,
                            'Coupon Name': latestPayment.couponName,
                            'Purchase Date': latestPayment.createdAt,
                            'Current Plan': selectedPeriod
                        });
                    }
                } else if (report.type === 'settlement') {
                    const bankdetails = await BankDetailRead.findAll({
                        where: {
                            userId: report.userId
                        },
                        raw: true,
                        logging: true
                    });
                    const bankIds = bankdetails.map((data) => data.id);
                    let date = moment(report.createdAt)
                        .subtract(report.period, 'months')
                        .format('YYYY-MM-DD');
                    data = await sequelizeRead.query(
                        `
						SELECT sd.createdAt as settlementDate, bd.beneficiaryName as 'Beneficiary Name' , bd.accountNumber as 'Account Number' ,
						 bd.ifscCode as 'IFSC Code'  , sd.utr as 'UTR Number',sd.amount as 'Amount settled' FROM settlement_details sd
						  INNER JOIN bank_details bd on bd.accountId = sd.accountId WHERE 
						  sd.createdAt >= ${date} AND sd.bankId IN (:bankIds)
					`,
                        {
                            logging: true,
                            type: QueryTypes.SELECT,
                            raw: true,
                            replacements: {
                                bankIds: bankIds
                            }
                        }
                    );
                } else if (report.type === 'expired') {
                    let date = moment(report.createdAt)
                        .subtract(report.period, 'months')
                        .format('YYYY-MM-DD');
                    const expiredMembers = await sequelizeRead.query(
                        `
						SELECT users.name, users.email , users.mobile, mgm.expiryDate, mgm.currentPlan  FROM member_group_map mgm INNER JOIN 
						 group_details gd on gd.id = mgm.groupId INNER JOIN users ON mgm.memberId = users.id WHERE gd.createdBy = ${report.userId}
						   AND (DATE(mgm.expiryDate) BETWEEN ${date}  AND CURDATE()) AND gd.id = ${report.channel} ;
						`,
                        {
                            logging: true,
                            type: QueryTypes.SELECT,
                            raw: true
                        }
                    );
                    console.log(data);
                    data = expiredMembers.map((member) => {
                        const plan =
                            member['currentPlan'] &&
                            JSON.parse(member['currentPlan']);
                        const selectedPeriod =
                            plan['selectedPeriod'] === 'Custom Period' &&
                            member['currentPlan']
                                ? `${plan['customValue']} ${plan['customType']}`
                                : plan['selectedPeriod'];
                        return {
                            Name: member['name'],
                            Email: member['email'],
                            Mobile: member['mobile'],
                            'Expiry Date': member['expiryDate'],
                            'Last Active Plan': selectedPeriod
                        };
                    });
                }

                if (!data.length) {
                    await ReportRequest.update(
                        { status: 'failed' },
                        {
                            where: {
                                id: report.id
                            }
                        }
                    );
                    console.log('no data to serve');
                    continue;
                }
                // create final json array and pass inside parse

                const csv = parse(data);
                console.log(csv);
                const file = {
                    filename: 'report.csv',
                    data: csv
                };
                let subject;
                let text;
                if (report.type == 'active') {
                    subject = 'FanKonnect Active User Report';
                    text = `Dear User,\n\nPlease find attached, report of active users of your channel.\n\n\nRegards,\n\nTeam Fankonnect
					`;
                }
                if (report.type == 'expired') {
                    subject = 'FanKonnect Expired User Report';
                    text = `Dear User,\n\nPlease find attached, report of expired users of your channel.\n\n\nRegards,\n\nTeam Fankonnect
					`;
                }
                if (report.type == 'settlement') {
                    subject = 'FanKonnect Settlement Report';
                    text = `Dear User,\n\nPlease find attached, your payment settlement report.\n\n\nRegards,\n\nTeam Fankonnect
					`;
                }

                const payload = {
                    from: 'support@classplus.co',
                    to: report.email,
                    subject: subject,
                    html: `<p>${text}</p>`,
                    attachment: [file]
                };

                const mailRes = report.email
                    ? await sendMailGunMail(payload)
                    : false;
                await ReportRequest.update(
                    { status: mailRes ? 'served' : 'failed' },
                    {
                        where: {
                            id: report.id
                        }
                    }
                );
            }
        } catch (err) {
            console.log(err);
            return new ResponseBuilder(
                400,
                { message: err.message },
                'Please check your input fields'
            );
        }
    }
}

export default new StatsService();
