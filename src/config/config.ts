'use strict';

export let config = {
    app: {
        title: 'Fankonnect',
        description: 'Fan Konnect',
        url: 'http://localhost:8085'
    },
    port: process.env.NODEJS_PORT || 8085,
    hostname: process.env.NODEJS_IP || 'localhost',
    authorization: 'x-access-token',

    toggle: {
        apidoc: process.env.TOGGLE_APIDOC || true,
        log: {
            files: process.env.ENABLE_LOG_FILE || true,
            console: process.env.ENABLE_CONSOLE || true
        }
    },

    jaeger: {
        host: process.env.JAEGER_HOST || 'localhost',
        port: process.env.JAEGER_PORT || 6832
    },

    db: {
        mssql: {
            root: {
                user: '',
                password: '',
                server: '',
                database: '',
                options: {
                    trustedConnection: false
                }
            }
        }
    }
};
