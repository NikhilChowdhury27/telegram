import _ from 'underscore';
import { IInclude } from './common.interface';

export default class CommonRepository {
    checkDefined(obj: object) {
        for (let key in obj) {
            if (!(obj[key] == undefined)) {
                if (
                    typeof obj[key] == 'object' &&
                    !Array.isArray(obj[key]) &&
                    obj[key] != null &&
                    !(obj[key] instanceof Date)
                ) {
                    return this.checkDefined(obj[key]);
                }
                return true;
            }
        }
        return false;
    }

    checkInclude(include: Array<IInclude>, filterFlag: boolean): boolean {
        if (include.length) {
            for (let i = 0; i < include.length; i++) {
                let currObject = include[i];
                if (!_.isEmpty(currObject)) {
                    if (currObject.include)
                        filterFlag = this.checkInclude(
                            currObject.include,
                            filterFlag
                        );
                    if (
                        !_.isEmpty(currObject.where) &&
                        this.checkDefined(currObject.where)
                    ) {
                        return true;
                    }
                }
            }
        } else {
            if (!_.isEmpty(include)) {
                if (include['include'] && !_.isEmpty(include['include']))
                    filterFlag = this.checkInclude(
                        include['include'],
                        filterFlag
                    );
                if (
                    include['where'] &&
                    !_.isEmpty(include['where']) &&
                    this.checkDefined(include['where'])
                ) {
                    return true;
                }
            }
        }
        return filterFlag;
    }
    checkFilterAndInclude(filter: object = null, include: any = []): boolean {
        if (_.isEmpty(filter) || !this.checkDefined(filter)) {
            return this.checkInclude(include, false);
        } else {
            return true;
        }
    }

    getFieldsFromDbResponse(dataRows, requiredFields: string) {
        const formattedResp = [];
        if (
            !dataRows ||
            !dataRows.length ||
            !requiredFields ||
            !requiredFields.length
        ) {
            return formattedResp;
        }

        const fields = requiredFields.split(',');
        for (let row of dataRows) {
            const formattedRow = [];
            for (let field of fields) {
                if (!row.dataValues) continue;
                formattedRow[field] = row.dataValues[field];
            }
            formattedResp.push(formattedRow);
        }

        if (fields.length === 1) {
            return _.pluck(formattedResp, fields[0]);
        }
        return formattedResp;
    }
}
