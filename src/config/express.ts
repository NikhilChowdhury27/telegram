'use strict';

import { initSwagger, getFinalSwagger } from 'base-packages';
/**
 * Module dependencies.
 */

let fs = require('fs'),
	http = require('http'),
	https = require('https'),
	path = require('path');

let express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	helmet = require('helmet'),
	mustacheExpress = require('mustache-express'),
	xss = require('xss-clean'),
	swaggerUi = require('swagger-ui-express'),
	// YAML = require('yamljs'),
	glob = require('glob');
const swaggerDocument = require('./../../swagger.json');
import { config } from './config';
import { log } from '../app/utils/error.utils';
// import { sequelize } from '../sequelize';
import compression = require('compression');
import * as cors from 'cors';
// let schema = require('../schema/schema').schema;

// import {schema as schema} from '../schema/schema';
// const i18n = require('./utils/localization');
module.exports = function () {
	// Initialize express app
	let app = express();
	app.use(compression());
	app.use((req, res, next) => {
		req.headers['accept-language'] = (
			req.headers['accept-language'] || 'en'
		).toLowerCase();
		next();
	});
	// app.use(i18n.init);
	initSwagger(swaggerDocument);

	app.use(
		cors({
			origin: '*'
		})
	);

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;

	// Passing the request url to environment locals
	app.use(function (req, res, next) {
		if (config.app.url) {
			app.locals.url = config.app.url + ':' + config.port;
		} else {
			res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		}
		next();
	});

	// Showing stack errors
	app.set('showStackError', true);

	// Config View Engine , server side rendering
	app.engine('server.view.html', mustacheExpress());
	app.set('view engine', 'server.view.html');
	app.set('views', path.join(__dirname, '../app/views/'));

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		let morgan = require('morgan');
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	} else if (process.env.NODE_ENV === 'alpha') {
		app.locals.cache = 'memory';
	} else if (process.env.NODE_ENV === 'secure') {
		let morgan = require('morgan');
		app.use(morgan('dev'));
	}
	app.use(
		bodyParser.urlencoded({
			limit: '20mb',
			extended: false,
			parameterLimit: 20000
		})
	);
	app.use(bodyParser.json({ limit: '20mb' }));
	app.use(xss());
	app.use(methodOverride());

	app.use(
		helmet({
			frameguard: false
		})
	);
	app.use(helmet.xssFilter());
	app.use(helmet.noSniff());
	app.use(helmet.ieNoOpen());
	app.disable('x-powered-by');

	app.set('jsonp callback', true);

	// Globbing routing files
	glob.sync('./**/routes/*.js').forEach(function (routePath) {
		require(path.resolve(routePath))(app);
	});

	app.use(express.static(path.join(__dirname, '../app/public')));

	if (config.toggle.apidoc) {
		app.use(
			'/api-docs',
			swaggerUi.serve,
			swaggerUi.setup(getFinalSwagger())
		);
	}

	// Assume 404 since no middleware responded
	app.use(function (req, res) {
		log('error', {
			message: 'Page Not Found - ' + req.url,
			payload: req.body || req.query
		});
		res.status(404).render(path.join(__dirname, '../app/views/error/404'), {
			head: {
				title: 'Page Not Found'
			},
			content: {
				title: 'OOPS!',
				description: 'Page Not Found. Error Code: 404'
			}
		});
	});

	let server;

	if (process.env.NODE_ENV === 'secure') {
		// Log SSL usage

		// Load SSL key and certificate
		let privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		let certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		server = https.createServer(
			{
				key: privateKey,
				cert: certificate
			},
			app
		);
	} else {
		server = http.createServer(app);
	}

	app.set('server', server);
	// try {
	// 	(async () => {
	// 		await sequelize.sync({ alter: false }); // # force : true will drop if tables exists
	// 	})();
	// } catch (err) {
	// 	console.error('error in syncing: ', err);
	// }

	// @ts-ignore
	delete Object.prototype.swaggerDocumentGlobal;
	// Return Express server instance
	return app;
};

export { };
