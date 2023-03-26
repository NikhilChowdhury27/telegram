const sonarqubeScanner = require('sonarqube-scanner');
require('dotenv').config();
sonarqubeScanner(
    {
        serverUrl: process.env.SONAR_SONAR_URL,
        options: {
            'sonar.login': process.env.SONAR_LOGIN,
            'sonar.projectKey': process.env.SONAR_PROJECT_KEY,
            'sonar.sources': '.',
            'sonar.inclusions': 'dist/**', // Entry point of the code
            'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info'
        }
    },
    () => {}
);
