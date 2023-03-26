// import * as redis from 'redis';
// import { promisifyAll } from 'bluebird';
// // let redisClient;

// promisifyAll(redis);

// const redisClient = redis.createClient({
//     url: `redis://${process.env.REDIS_URL}`
// });

// // async function checkRedis() {
// //     if (!redisClient) {
// //         redisClient = await redis.createClient({
// //             url: `redis://${process.env.REDIS_URL}`
// //         });
// //         redisClient.connect();
// //         return redisClient;
// //     }
// //     redisClient.connect();
// //     return redisClient;
// // }

// // checkRedis();

// redisClient.connect();

// redisClient.on('connect', function () {
//     console.log('Redis Database connected' + '\n');
// });

// redisClient.on('reconnecting', function () {
//     console.log('Redis client reconnecting');
// });

// redisClient.on('ready', function () {
//     console.log('Redis client is ready');
// });

// redisClient.on('error', function (err) {
//     console.log('Something went wrong ' + err);
// });

// redisClient.on('end', function () {
//     console.log('\nRedis client disconnected');
//     console.log('Server is going down now...');
//     process.exit();
// });
import { redisClient } from '../../server';
class RedisManager {
    constructor() {}

    static addToSet = async (keyName: string, values: string[]) => {
        // const redisClient = await checkRedis();
        return await redisClient.sAdd(keyName, values);
    };

    static rPush = async (keyName: string, values: string | string[]) => {
        // const redisClient = await checkRedis();
        const result = await redisClient.rPush(keyName, values);
        console.log(result);
        return result;
    };

    static rPopLpush = async (keyName: string) => {
        // const redisClient = await checkRedis();
        return await redisClient.RPOPLPUSH(keyName, keyName);
    };

    static popFromSet = async (keyName: string, limit: number) => {
        // const redisClient = await checkRedis();
        return await redisClient.sPop(keyName, limit);
    };

    static getMembersFromSet = async (keyName: string) => {
        // const redisClient = await checkRedis();
        return await redisClient.sMembers(keyName);
    };

    static incrCount = async (keyName: string) => {
        const members = await redisClient.incr(keyName);
        return members;
    };

    static setMember = async (keyName: string, value: number) => {
        const members = await redisClient.set(keyName, value);
        return members;
    };

    static setData = async (keyName: string, value: number | string) => {
        const setData = await redisClient.set(keyName, value);
        return setData;
    };

    static decrCount = async (keyName: string) => {
        const members = await redisClient.decr(keyName);
        return members;
    };

    static getCount = async (keyName: string) => {
        const members = await redisClient.get(keyName);
        return members;
    };

    static delMember = async (keyName: string) => {
        const members = await redisClient.del(keyName);
        return members;
    };

    static addToHashmap = async (keyName: string, data: any) => {
        const result = await redisClient.hSet(keyName, data);
        return result;
    };

    static getFromHashmap = async (keyName: string) => {
        const data = await redisClient.hGetAll(keyName);
        return data;
    };

    static searchKeys = async (pattern: string) => {
        // const redisClient = await checkRedis();
        return await redisClient.keys(pattern);
    };

    static expireKey = async (keyName: string, seconds: number) => {
        // const redisClient = await checkRedis();
        return await redisClient.expire(keyName, seconds);
    };

    static setNx = async (keyName: string, value: number) => {
        // const redisClient = await checkRedis();
        return await redisClient.SETNX(keyName, value);
    };
}

export default RedisManager;
