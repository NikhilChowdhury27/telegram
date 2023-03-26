//const moment = require('moment');
class FlattenObj {
    async flat(obj, flag) {
        let newObj = {};
        for (const prop in obj) {
            if (
                typeof obj[prop] === 'object' &&
                obj[prop] !== null &&
                !Array.isArray(obj[prop]) &&
                !(obj[prop] instanceof Date)
            ) {
                const tempObj = await this.flat(obj[prop], flag);
                newObj = {
                    ...newObj,
                    ...tempObj
                };
            } else if (prop === 'id' && flag) {
                delete obj[prop];
            } else {
                if (prop === 'id') {
                    flag = true;
                }
                // if (obj[prop] instanceof Date) {
                //     newObj[prop] = moment(obj[prop]).format('DD/MM/YYYY');
                // } else {
                //     newObj[prop] = obj[prop];
                // }
                newObj[prop] = obj[prop];
            }
        }
        return newObj;
    }
}
export default new FlattenObj();
