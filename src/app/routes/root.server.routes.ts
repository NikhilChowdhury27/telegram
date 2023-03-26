'use strict';
import { healthCheck } from '../utils/health.utils';
import ProcessMonitor from '../../processMonitor';
let glob = require('glob');
let path = require('path');

const statusMonitorConfig = JSON.parse(
    process.env.STATUS_MONITOR_CONFIG || '{}'
);
const statusMonitor = require('express-status-monitor')(
    statusMonitorConfig ? statusMonitorConfig : {}
);
module.exports = function (app) {
    app.use(statusMonitor);
    app.get(
        '/health-check',
        function (req, res, next) {
            res.setHeader(
                'Content-Security-Policy',
                "default-src *;style-src 'self' 'unsafe-inline'; script-src * 'self' 'unsafe-inline';connect-src * ;"
            );
            next();
        },
        statusMonitor.pageRoute
    );
    app.get('/health-check1', async function (req, res) {
        console.log('health-check1');
        res.json(await healthCheck());
    });
    app.get('/', function (req, res) {
        res.render('index', {
            head: {
                title: 'CLP CONNECT'
            },
            content: {
                title: 'CLP CONNECT!!',
                description:
                    'Welcome to CLASSPLUS CONNECT. This is preview page.'
            }
        });
    });

    app.use('/alive', function (req, res) {
        if (ProcessMonitor.isAlive()) {
            return res.status(200).json({ data: { msg: 'Alive' } });
        }
        return res.status(500).json({ data: { msg: 'Dead' } });
    });

    app.use('/.well-known/assetlinks.json', function (req, res) {
        if (ProcessMonitor.isAlive()) {
            return res.status(200).json([
                {
                    relation: ['delegate_permission/common.handle_all_urls'],
                    target: {
                        namespace: 'android_app',
                        package_name: 'com.fankonnect.app',
                        sha256_cert_fingerprints: [
                            '60:C4:91:5A:F2:EE:38:4C:FE:37:D2:28:D3:26:59:A3:27:AF:BE:4D:05:EA:5B:49:69:E4:D8:28:98:52:BA:F9'
                        ]
                    }
                }
            ]);
        }
        return res.status(500).json({ data: { msg: 'Dead' } });
    });

    app.use('/apple-app-site-association', function (req, res) {
        if (ProcessMonitor.isAlive()) {
            return res.status(200).json({
                applinks: {
                    apps: [],
                    details: [
                        {
                            appIDs: ['MPTFN7WG8F.co.fankonnect.app'],
                            paths: ['*']
                        }
                    ]
                }
            });
        }
        return res.status(500).json({ data: { msg: 'Dead' } });
    });

    app.use('/notAuthorized', function (req, res) {
        console.log(__dirname);
        return res.status(200).sendFile('./index.html', { root: __dirname });
    });

    const paths = ['/clp-connect'];
    glob.sync('./**/routes/v1/*.js').forEach(function (routePath) {
        for (let i = 0; i < paths.length; i++) {
            require(path.resolve(routePath))(app, paths[i]);
        }
        // require(path.resolve(routePath))(app);
    });

    // Set params if needed
    // app.param('Id', apiCtrl.func);
};
