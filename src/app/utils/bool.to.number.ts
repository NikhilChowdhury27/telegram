export async function boolToNumber(obj) {
    for (const prop in obj) {
        if (typeof obj[prop] === 'boolean') {
            obj[prop] = obj[prop] ? 1 : 0;
        } else if (
            typeof obj[prop] === 'object' &&
            obj[prop] !== null &&
            !(obj[prop] instanceof Date)
        ) {
            await boolToNumber(obj[prop]);
        }
    }
    return obj;
}
