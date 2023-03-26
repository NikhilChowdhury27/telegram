export default class MongoConnections {
    static get connections() {
        return [
            {
                name: 'mongo1',
                mongoURL: 'mongodb://localhost:27017/boilerplate'
            }
        ];
    }
}
