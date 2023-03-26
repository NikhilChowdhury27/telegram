import CommonService from '../../../utils/common.service';

import { SUCCESS_200 } from '../../../../config/constants/errorMessages';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../../../../sequelize';
import PaymentTable from '../../../../models/PaymentTable';
import BankDetail from '../../../../models/BankDetail';
import SettlementDetails from '../../../../models/settlementDetails';
// import GroupDetails from '../../../../models/GroupDetail';
// import GroupDetails from '../../../../models/GroupDetail';

class UserEarnings extends CommonService {
    async getUserEarnings(data: any, user) {
        try {
            const { id } = user;
            let earningsQuery;

            if (!data.startDate || !data.endDate) {
                console.log('inside overall');
                earningsQuery = `
				SELECT SUM(pt.amount) as totalIncome, pt.groupId, gd.groupName  ,gd.updatedAt, gd.logoUrl  FROM payment_table pt LEFT OUTER JOIN group_details gd ON pt.groupId = gd.id
				WHERE pt.sellerId = ${id} AND (pt.status = 'Success' OR pt.paymentStatus = 'success') AND gd.groupName IS NOT NULL GROUP BY pt.groupId  ORDER BY gd.updatedAt DESC LIMIT ${
                    Number(data.limit) || 10
                } 
					OFFSET ${Number(data.offset) || 0}`;
            } else if (data.startDate && data.endDate) {
                earningsQuery = `
				SELECT SUM(pt.amount) as totalIncome, pt.groupId, gd.groupName  ,gd.updatedAt , gd.logoUrl  FROM payment_table pt LEFT OUTER JOIN group_details gd ON pt.groupId = gd.id
				WHERE pt.sellerId = ${id} AND (pt.status = 'Success' OR pt.paymentStatus = 'success') AND gd.groupName IS NOT NULL
				   AND pt.createdAt BETWEEN '${data.startDate}' AND '${data.endDate}'
				   GROUP BY pt.groupId ORDER BY gd.updatedAt DESC LIMIT ${
                       Number(data.limit) || 10
                   }
				  		OFFSET ${Number(data.offset) || 0}`;
            }

            const filter = {
                sellerId: id,
                [Op.or]: [{ status: 'Success' }, { paymentStatus: 'success' }]
            };
            if (data.startDate && data.endDate) {
                filter['createdAt'] = {
                    $between: [data.startDate, data.endDate]
                };
            }
            const [earnings, clubbedEarnings] = await Promise.all([
                sequelize.query(earningsQuery, {
                    type: QueryTypes.SELECT
                }),
                PaymentTable.findAll({
                    where: filter,
                    attributes: [
                        [
                            sequelize.fn('sum', sequelize.col('amount')),
                            'totalIncome'
                        ]
                    ]
                })
            ]);

            const finalEarning = earnings.map((earning) => {
                return {
                    ...earning,
                    totalIncome:
                        Math.round(earning['totalIncome']) !=
                            earning['totalIncome'] && earning['totalIncome']
                            ? Number(earning['totalIncome'].toFixed(2))
                            : Number(earning['totalIncome'])
                };
            });

            return {
                statusCode: 200,
                data: {
                    earnings: finalEarning,
                    totalEarnings:
                        clubbedEarnings.length &&
                        clubbedEarnings[0]['dataValues']['totalIncome']
                            ? Number(
                                  clubbedEarnings[0]['dataValues'][
                                      'totalIncome'
                                  ].toFixed(2)
                              )
                            : 0
                },

                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async getUserEarningsV2(data: any, user) {
        try {
            const { id } = user;
            let earningsQuery;

            if (!data.startDate || !data.endDate) {
                console.log('inside overall');
                earningsQuery = `
				SELECT ROUND(SUM(pt.amount - pt.fankonnectCommission), 2) as totalIncome, pt.groupId, gd.groupName  ,gd.updatedAt, gd.logoUrl  FROM payment_table pt LEFT OUTER JOIN group_details gd ON pt.groupId = gd.id
				WHERE pt.sellerId = ${id} AND (pt.status = 'Success' OR pt.paymentStatus = 'success') AND gd.groupName IS NOT NULL  AND pt.migrated IS NULL GROUP BY pt.groupId  ORDER BY gd.updatedAt DESC LIMIT ${
                    Number(data.limit) || 10
                } 
					OFFSET ${Number(data.offset) || 0}`;
            } else if (data.startDate && data.endDate) {
                earningsQuery = `
				SELECT ROUND(SUM(pt.amount - pt.fankonnectCommission), 2) as totalIncome, pt.groupId, gd.groupName  ,gd.updatedAt , gd.logoUrl  FROM payment_table pt LEFT OUTER JOIN group_details gd ON pt.groupId = gd.id
				WHERE pt.sellerId = ${id} AND (pt.status = 'Success' OR pt.paymentStatus = 'success') AND gd.groupName IS NOT NULL  AND pt.migrated IS NULL
				   AND pt.createdAt BETWEEN '${data.startDate}' AND '${data.endDate}'
				   GROUP BY pt.groupId ORDER BY gd.updatedAt DESC LIMIT ${
                       Number(data.limit) || 10
                   }
				  		OFFSET ${Number(data.offset) || 0}`;
            }

            const filter = {
                sellerId: id,
                migrated: null,
                [Op.or]: [{ status: 'Success' }, { paymentStatus: 'success' }]
            };
            if (data.startDate && data.endDate) {
                filter['createdAt'] = {
                    $between: [data.startDate, data.endDate]
                };
            }
            const [earnings, clubbedEarnings, bankIds] = await Promise.all([
                sequelize.query(earningsQuery, {
                    type: QueryTypes.SELECT
                }),
                PaymentTable.findAll({
                    where: filter,
                    attributes: [
                        [
                            sequelize.fn(
                                'sum',
                                sequelize.where(
                                    sequelize.col('amount'),
                                    '-',
                                    sequelize.col('fankonnectCommission')
                                )
                            ),
                            'totalIncome'
                        ]
                    ]
                }),
                BankDetail.findAll({
                    where: {
                        userId: id
                    },
                    attributes: ['id'],
                    raw: true
                })
            ]);
            const BankIdList = bankIds.map((data) => data.id);

            const settlementSum = await SettlementDetails.findAll({
                attributes: [
                    [
                        sequelize.fn('sum', sequelize.col('amount')),
                        'total_amount'
                    ]
                ],
                where: {
                    bankId: {
                        $in: BankIdList
                    }
                },
                raw: true
            });
            // const finalEarning = earnings.map((earning) => {
            //     return {
            //         ...earning,
            //         totalIncome:
            //             Math.round(earning['totalIncome']) !=
            //                 earning['totalIncome'] && earning['totalIncome']
            //                 ? Number(earning['totalIncome'].toFixed(2))
            //                 : Number(earning['totalIncome'])
            //     };
            // });
            console.log(settlementSum);

            return {
                statusCode: 200,
                data: {
                    earnings: earnings,
                    totalEarnings:
                        clubbedEarnings.length &&
                        clubbedEarnings[0]['dataValues']['totalIncome']
                            ? Number(
                                  clubbedEarnings[0]['dataValues'][
                                      'totalIncome'
                                  ].toFixed(2)
                              )
                            : 0,
                    settlementSum: settlementSum[0]['total_amount']
                        ? settlementSum[0]['total_amount'] / 100
                        : settlementSum[0]['total_amount']
                },

                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default new UserEarnings();
