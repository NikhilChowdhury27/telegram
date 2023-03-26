const pidusage = require('pidusage');
const os = require('os');
const v8 = require('v8');

export const healthCheck = () => {
    return new Promise((resolve, reject) => {
        pidusage(process.pid, (err, stat) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            stat.memory = stat.memory / 1024 / 1024;
            stat.load = os.loadavg();
            stat.timestamp = Date.now();
            stat.heap = v8.getHeapStatistics();
            resolve(stat);
        });
    });
};
