import MySqlConnections from './conf/MySqlConnections';
// import RedisConnections from './conf/RedisConnections';

const { initSQL /* initRedis */ } = require('base-packages');

module.exports = async function () {
    await initSQL(MySqlConnections.connections);
    // await initRedis(RedisConnections.connections);
};
