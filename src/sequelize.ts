import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Op } from 'sequelize';
import * as path from 'path';
import { ReplicationOptions, ConnectionOptions } from 'sequelize/types';

let options = {} as SequelizeOptions;
options.database = process.env.SEQUELIZE_WRITE_DB_NAME;
options.models = [path.join(__dirname, '/models')];
options.logging = false;
options.dialect = 'mysql';
options.operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
};

if (process.env.NODE_ENV === 'test') {
    options.dialect = 'sqlite';
    options.storage = 'database.sqlite3';
    options.host = 'localhost';
    options.logging = false;
}

if (process.env.NODE_ENV !== 'test') {
    options.dialect = 'mysql';
    options.dialectOptions = {
        ssl: false
    };
    options.port = Number(process.env.SEQUELIZE_WRITE_DB_PORT);
    // options.logging = async function (query: any, value: any) {
    //     const query1 = query.split(': ')[1];
    //     const bind = value.bind || [];
    //     mirror.query(query1, bind);
    // };
    options.logging = false;
    options.replication = {} as ReplicationOptions;
    let read = {} as ConnectionOptions;
    let write = {} as ConnectionOptions;
    options.replication.read = [read];
    options.replication.write = write;

    read.host = process.env.SEQUELIZE_READ_DB_HOST;
    read.username = process.env.SEQUELIZE_READ_DB_USER;
    read.password = process.env.SEQUELIZE_READ_DB_PASSWORD;

    write.host = process.env.SEQUELIZE_WRITE_DB_HOST;
    write.username = process.env.SEQUELIZE_WRITE_DB_USER;
    write.password = process.env.SEQUELIZE_WRITE_DB_PASSWORD;

    let pool = {};
    // pool['max'] = Number(process.env.SEQUELIZE_DB_MAX_CONNECTION);
    // pool['min'] = 1;
    // pool['idle'] = 10000;
    // pool['acquire'] = 10000;
    options.pool = pool;
    options.retry = {
        match: [
            /ETIMEDOUT/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ESOCKETTIMEDOUT/,
            /EHOSTUNREACH/,
            /EPIPE/,
            /EAI_AGAIN/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /SequelizeConnectionAcquireTimeoutError/
        ],
        max: 3
    };
}

export const sequelize = new Sequelize(
    process.env.SEQUELIZE_WRITE_DB_NAME,
    process.env.SEQUELIZE_WRITE_DB_USER,
    process.env.SEQUELIZE_WRITE_DB_PASSWORD,
    {
        ...options
    }
);

export const sequelizeRead = new Sequelize(
    process.env.READ_DB_NAME,
    process.env.READ_DB_USER,
    process.env.READ_WRITE_DB_PASSWORD,
    {
        ...options,
        models: [path.join(__dirname, '/modelsRead')],
        host: process.env.SEQUELIZE_WRITE_DB_HOST,
        password: process.env.REPLICA_PWD,
        username: process.env.REPLICA_USER,
        database: process.env.SEQUELIZE_WRITE_DB_NAME
    }
);
