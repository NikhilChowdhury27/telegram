import { WhereOptions } from 'sequelize/types';
import User from '../../models/User';
import { FILTER_ERR } from '../../config/constants/common.const';
import CommonRepository from '../utils/common.repository';

class UserRepository extends CommonRepository {
    async findUser(
        filter: WhereOptions<User>,
        projection: Array<string>,
        useMaster: boolean = false
    ) {
        try {
            let isFilterAndIncludeExist = this.checkFilterAndInclude(filter);
            if (!isFilterAndIncludeExist) {
                throw new Error(FILTER_ERR.MESSAGE);
            }
            return await User.findAll({
                where: filter,
                attributes: projection,
                useMaster,
                raw: true,
                nest: true
            });
        } catch (error) {
            if (error.message == FILTER_ERR.MESSAGE) {
                let err = new Error();
                err.message = FILTER_ERR.MESSAGE;
                err['errCode'] = FILTER_ERR.CODE;
                throw err;
            }
            throw new Error(error);
        }
    }

    async findOneById(userId: number) {
        const user = await User.findOne({
            where: {
                id: userId
            }
        });
        return user;
    }

    async findUserDetails(userId: number, attributes: any) {
        const user = await User.findOne({
            attributes: attributes,
            where: {
                id: userId
            }
        });
        return user;
    }

    async findUserByMobile(mobile) {
        const user = await User.findOne({
            where: {
                mobile: mobile
            }
        });
        return user;
    }

    async findOrCreateByNumber(payload: any) {
        const defaults = {
            mobile: payload.mobile,
            name: payload.name,
            isActive: 1,
            whatsappStatus: 1
        };
        if (payload.email) {
            const userEmail = await User.findOne({
                where: {
                    email: payload.email
                }
            });
            if (!userEmail || userEmail.mobile == payload.mobile) {
                defaults['email'] = payload.email;
            }
        }
        const [user, created] = await User.findOrCreate({
            where: {
                mobile: payload.mobile
            },
            defaults: defaults
        });
        return {
            user,
            created
        };
    }

    async createUser(userCreateData) {
        try {
            return await User.create(<any>userCreateData);
        } catch (error) {
            throw new Error(error.name);
        }
    }

    async updateUser(filter, updateData) {
        try {
            let isFilterAndIncludeExist = this.checkFilterAndInclude(filter);
            if (!isFilterAndIncludeExist) {
                throw new Error(FILTER_ERR.MESSAGE);
            }
            return await User.update(updateData, { where: filter });
        } catch (e) {
            console.log('update user', e);
            throw new Error(e);
        }
    }

    async findOneUser(
        filter: WhereOptions<User>,
        projection: Array<string>,
        useMaster: boolean = false,
        limit
    ) {
        try {
            let isFilterAndIncludeExist = this.checkFilterAndInclude(filter);
            if (!isFilterAndIncludeExist) {
                throw new Error(FILTER_ERR.MESSAGE);
            }
            return await User.findAll({
                where: filter,
                attributes: projection,
                useMaster,
                raw: true,
                nest: true,
                limit
            });
        } catch (error) {
            if (error.message == FILTER_ERR.MESSAGE) {
                let err = new Error();
                err.message = FILTER_ERR.MESSAGE;
                err['errCode'] = FILTER_ERR.CODE;
                throw err;
            }
            throw new Error(error);
        }
    }
}

export default new UserRepository();
