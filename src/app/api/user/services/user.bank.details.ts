import generateRazorpayAccountId from '../../../utils/razorpay/generateRazorpayAccountId';
import { SUCCESS_200 } from '../../../../config/constants/errorMessages';
import BankDetailRepository from '../../../repository/bank.detail.repository';
import CommonService from '../../../utils/common.service';
import { IBankDetail, IBankStatusUpdate } from '../user.interface';
import BankDetail from '../../../../models/BankDetail';
import BankDetailsLogs from '../../../../models/bank_details_logs';
import User from '../../../../models/User';
import CreatorInfo from '../../../../models/CreatorInfo';

class UserBankDetail extends CommonService {
    async addBankDetail(data: IBankDetail) {
        try {
            let accountIdObject = null;
            let bankDetails;
            try {
                bankDetails = await BankDetail.findAll({
                    where: {
                        userId: data.userId
                    },
                    raw: true
                });

                // if (bankDetails) {
                //     return {
                //         statusCode: 400,
                //         data: {},
                //         message: 'Account data already exists'
                //     };
                // }
                accountIdObject = await generateRazorpayAccountId(
                    data.beneficiaryName,
                    data.emailId,
                    data.accountNumber,
                    data.ifscCode
                );
                console.log(accountIdObject);

                if (accountIdObject && accountIdObject.error) {
                    return {
                        statusCode: 400,
                        data: {},
                        message: accountIdObject.error
                    };
                }
            } catch (error) {
                if (error.message.includes('IFSC')) {
                    return {
                        statusCode: 400,
                        data: {},
                        message: error.message
                    };
                }
                if (error.message.includes('-')) {
                    return {
                        statusCode: 400,
                        data: {},
                        message: error.message.split('-')[0]
                    };
                }
                console.log('ADD BANK ERROR >>>> ', error.message);
                return {
                    statusCode: 400,
                    data: {},
                    message: error.message
                };
            }
            const payload = {
                beneficiaryName: data.beneficiaryName,
                ifscCode: data.ifscCode,
                accountNumber: data.accountNumber,
                emailId: data.emailId,
                accountId: accountIdObject.accountId,
                userId: data.userId,
                relationshipWithUser: data.relationshipWithUser
            };
            if (!bankDetails.length) {
                payload['isPrimary'] = 1;
            }

            await BankDetailRepository.addBankDetail(payload);
            await CreatorInfo.findOrCreate({
                where: {
                    userId: data.userId
                },
                defaults: {
                    userId: data.userId
                }
            });
            return {
                statusCode: 200,
                data: {},
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async changeBankDetails(data: IBankStatusUpdate) {
        try {
            if (data.isPrimary) {
                await BankDetail.update(
                    {
                        isPrimary: false
                    },
                    {
                        where: {
                            userId: data.userId
                        }
                    }
                );

                await BankDetail.update(
                    {
                        isPrimary: true
                    },
                    {
                        where: {
                            id: data.bankDetailId
                        }
                    }
                );
                return {
                    statusCode: 200,
                    data: {},
                    message: SUCCESS_200
                };
            }
            if (data.isDeleted) {
                const bankDetails = await BankDetail.findOne({
                    where: {
                        id: data.bankDetailId,
                        isDeleted: false,
                        isPrimary: false
                    }
                });

                if (!bankDetails) {
                    return {
                        statusCode: 400,
                        data: {},
                        message: 'Bank Account does not exist'
                    };
                }
                await BankDetail.update(
                    {
                        isDeleted: true,
                        deletedAt: new Date()
                    },
                    {
                        where: {
                            id: data.bankDetailId
                        }
                    }
                );

                return {
                    statusCode: 200,
                    data: {},
                    message: SUCCESS_200
                };
            }
        } catch (error) {
            console.log('error in Bank status change', error);
            throw new Error(error);
        }
    }

    async getAllBankDetails(userId: number) {
        try {
            const bankDetails = await BankDetail.findAll({
                where: {
                    userId: userId,
                    isActive: true,
                    isDeleted: false
                },
                order: [['isPrimary', 'DESC']]
            });
            return {
                statusCode: 200,
                data: bankDetails,
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async acceptBankPolicy(data: any) {
        try {
            const { userId, accountId, ipAddress, action } = data;
            const result = await BankDetailsLogs.create({
                userId: userId,
                accountId: accountId,
                ipAddress: ipAddress,
                action: action
            });
            return {
                statusCode: 200,
                data: result,
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async migrateBank() {
        try {
            const bankDetails = await BankDetail.findAll({
                where: {
                    isDeleted: 0,
                    isActive: 1
                },
                raw: true
            });

            for (let bankDetail of bankDetails) {
                const user = await User.findOne({
                    where: {
                        id: bankDetail.userId
                    },
                    attributes: ['email'],
                    raw: true
                });
                console.log(
                    'testing',
                    bankDetail.userId,
                    bankDetail.fankonnectCommisionPerc
                );
                await Promise.all([
                    CreatorInfo.findOrCreate({
                        where: {
                            userId: bankDetail.userId
                        },
                        defaults: {
                            fankonnectCommisionPerc:
                                bankDetail.fankonnectCommisionPerc,
                            userId: bankDetail.userId
                        }
                    }),
                    BankDetail.update(
                        {
                            emailId: user.email || '',
                            isPrimary: true,
                            isDeleted: false
                        },
                        {
                            where: {
                                id: bankDetail.id
                            }
                        }
                    )
                ]);
            }
            return {
                statusCode: 200,
                data: 'Migrated',
                message: SUCCESS_200
            };
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
}

export default new UserBankDetail();
