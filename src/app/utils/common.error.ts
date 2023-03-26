import Common from '../../config/constants/common';
import { customErrInterface } from './common.interface';
const { ResponseBuilder } = require('base-packages');
class CustomError extends Error implements customErrInterface {
	type: 'CustomError';

	data: any;

	constructor(message: string, dataObj: object = {}) {
		super(message);
		this.type = 'CustomError';
		this.data = dataObj;
		console.log('CustomError occur, ', message);
	}

	response(
		status: number = 400,
		msg: string = null,
		intl: object = {
			lang: 'en',
			fn: '__mf',
			params: { name: '' }
		}
	) {
		let isProd = process.env.NODE_ENV === 'production';
		if (typeof status === 'string') {
			msg = status;
			status = 400;
		}
		return new ResponseBuilder(
			isProd ? 500 : status,
			isProd ? {} : this.data,
			isProd ? Common.ERROR_500 : msg ? msg : this.message,
			intl
		);
	}
}

export default CustomError;
