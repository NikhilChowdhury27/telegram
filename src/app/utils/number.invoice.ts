export default async function leading_zero(redisIncr: number, minSize: number) {
    let new_num = redisIncr.toString();
    for (let i = new_num.length; i < minSize; i++) {
        new_num = '0' + new_num;
    }
    return new_num;
}
