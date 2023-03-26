export default class RedisConnections {
    static get connections() {
        return [
            {
                name: process.env.REDIS_DB_NAME,
                redisURL: `redis://${process.env.REDIS_URL}`
            }
        ];
    }
}
