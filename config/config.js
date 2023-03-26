const path = require('path');
const { homedir } = require('os');
const fs = require('fs');

module.exports = {
    development: {
        database: 'classplus-staging',
        host: 'localhost',
        dialect: 'mysql',
        username: 'root',
        password: 'himanshu',
        models: [path.join(__dirname, './../src/models')],
        logging: true,
        dialectOptions: {}
    },
    test: {
        logging: true,
        dialect: 'sqlite',
        storage: 'database.sqlite3'
        // models: [path.join(__dirname, './../src/models')]
    }
};
