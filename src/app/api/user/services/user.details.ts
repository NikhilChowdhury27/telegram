import CommonService from '../../../utils/common.service';
import { USER_TABS } from '../../../../config/constant';
import UserRepository from '../../../repository/user.repository';
import bankDetailRepository from '../../../repository/bank.detail.repository';
import {
    BAD_CLIENT_REQUEST_400,
    SUCCESS_200
} from '../../../../config/constants/errorMessages';
import { indianStates } from '../../../utils/states';
import ReceiptDetail from '../../../../models/ReceiptDetails';
import CreatorInfo from '../../../../models/CreatorInfo';
import { sequelizeRead } from '../../../../sequelize';
import { QueryTypes } from 'sequelize';
const GOLBAL_SESSION = process.env.FE_GLOBAL_SESSION;

class UserDetails extends CommonService {
    async getUserDetails(user) {
        try {
            let response = {
                tabs: USER_TABS,
                session: true
            };

            const { id } = user;
            const filter = { id };
            const projection = [
                'id',
                'name',
                'email',
                'telegramUserId',
                'imageUrl',
                'session',
                'mobile',
                'telegramUsername',
                'state'
            ];

            const userData = await UserRepository.findUser(filter, projection);

            const [gstInfo, orgInfo] = await Promise.all([
                ReceiptDetail.findOne({
                    where: {
                        userId: id
                    },
                    attributes: ['id']
                }),
                CreatorInfo.findOne({
                    where: {
                        userId: id
                    }
                })
            ]);

            if (!userData || !userData.length) {
                return {
                    statusCode: 400,
                    data: {},
                    message: BAD_CLIENT_REQUEST_400
                };
            }
            let state;
            if (userData[0].state) {
                state = indianStates().find((x) => x.name == userData[0].state);
                console.log(state);
            }
            const bankDetails = await bankDetailRepository.getBankDetail({
                userId: id
            });
            response['userDetails'] = userData[0];
            response['userState'] = state
                ? {
                      id: state.id,
                      name: state.name
                  }
                : null;
            if (bankDetails) {
                response['bankDetails'] = {
                    beneficiaryName: bankDetails.beneficiaryName
                        ? bankDetails.beneficiaryName
                        : null,
                    accountNumber: bankDetails.accountNumber
                        ? bankDetails.accountNumber
                        : null,
                    ifscCode: bankDetails.ifscCode ? bankDetails.ifscCode : null
                };
            } else {
                response['bankDetails'] = null;
            }
            if (!userData[0].session) {
                response['session'] = false;
            }
            response['globalSession'] = GOLBAL_SESSION;

            // response['plans'] = PRICING_PLANS;
            response['pricingperiods'] = [
                {
                    id: 1,
                    label: 'Weekly',
                    value: 'Weekly'
                },
                {
                    id: 2,
                    label: '2 Weeks',
                    value: '2 Weeks'
                },
                {
                    id: 3,
                    label: 'Monthly',
                    value: 'Monthly'
                },
                {
                    id: 4,
                    label: '2 Months',
                    value: '2 Months'
                },
                {
                    id: 5,
                    label: '3 Months',
                    value: '3 Months'
                },
                {
                    id: 6,
                    label: '6 Months',
                    value: '6 Months'
                },
                {
                    id: 7,
                    label: '1 Year',
                    value: '1 Year'
                },
                {
                    id: 8,
                    label: 'Lifetime',
                    value: 'Lifetime'
                },
                {
                    id: 9,
                    label: 'Custom Period',
                    value: 'Custom Period'
                }
            ];

            response['offers'] = [
                {
                    id: 1,
                    label: 'Limited Period Offer',
                    value: 'Limited Period Offer'
                },
                {
                    id: 2,
                    label: 'Special Offer',
                    value: 'Special Offer'
                },
                {
                    id: 3,
                    label: 'Festive Offer',
                    value: 'Festive Offer'
                }
            ];

            response['categories'] = [
                {
                    id: 1,
                    label: 'Stock Market',
                    value: 'Stock Market'
                },
                {
                    id: 2,
                    label: 'Personal Finance',
                    value: 'Personal Finance'
                },
                {
                    id: 3,
                    label: 'Yoga',
                    value: 'Yoga'
                },
                {
                    id: 4,
                    label: 'Personal Growth',
                    value: 'Personal Growth'
                }
            ];

            response['profileFilled'] = Boolean(gstInfo);
            response['orgId'] = orgInfo ? orgInfo.id : null;

            return {
                statusCode: 200,
                data: response,
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async getUserDetailsFromReplica(user) {
        try {
            const data = await sequelizeRead.query(
                `
				SELECT * FROM users WHERE id=${user.id} `,
                { type: QueryTypes.SELECT }
            );
            return {
                statusCode: 200,
                data,
                message: SUCCESS_200
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async getStatesList() {
        const states = indianStates().map((x) => {
            return {
                id: x.id,
                name: x.name
            };
        });

        return {
            statusCode: 200,
            data: states,
            message: SUCCESS_200
        };
    }
}

export default new UserDetails();
