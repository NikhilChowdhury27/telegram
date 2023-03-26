/* eslint-disable no-use-before-define */

const { fork } = require('child_process');
const mysql = require('mysql2/promise');
const requestP = require('request-promise');

exports = module.exports = class MySQLMirror {
    public static _opts;
    public static child;
    constructor(opts) {
        MySQLMirror._opts = JSON.parse(JSON.stringify(opts));
        delete MySQLMirror._opts.ssl;
        // this._opts.host = ".....todo"; // todo add connection point
        MySQLMirror._opts.host = 'gcp-mysql-db.classplus.co'; // todo add connection point
    }

    async init() {
        const child = fork(__filename, ['worker']);
        child.on('error', (err) => {
            console.log('ERROR IN MIRROR CHILD PROCESS');
        });
        child.send({ initOpts: MySQLMirror._opts });
        MySQLMirror.child = child;
    }

    async query(...args) {
        try {
            MySQLMirror.child.send(args);
        } catch (c) {
            console.log(c);
        }
    }
};

class MirrorWorker {
    public static lastErrorMessage;
    public static opts;
    public static _pool;
    constructor() {
        console.log('MYSQL Mirror Worker Online');
        process.on('message', this.onMessage);
        MirrorWorker.lastErrorMessage = null;
    }

    public static async reportError(err, args) {
        try {
            await requestP({
                method: 'POST',
                url: 'https://skynet.classplusapp.com/report-mirror-error',
                json: {
                    message: err.message,
                    args: args
                }
            });
        } catch (c) {
            console.log('Unable to report error because ', c.message);
        }
    }

    async onMessage(args) {
        if (args.initOpts) {
            MirrorWorker.opts = args.initOpts;
            MirrorWorker._pool = mysql.createPool(MirrorWorker.opts);
            return;
        }
        try {
            await MirrorWorker._pool.query(...args);
            MirrorWorker.lastErrorMessage = null;
            process.stdout.write('.');
        } catch (c) {
            if (MirrorWorker.lastErrorMessage !== c.message) {
                MirrorWorker.lastErrorMessage = c.message;

                await MirrorWorker.reportError(c, args);
            }
        }
    }
}

if (process.argv[2] === 'worker') {
    new MirrorWorker();
    process.stdin.resume();
}
