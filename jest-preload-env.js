require('dotenv').config({ path: '.env' });
const iconv = require('iconv-lite');
const encodings = require('iconv-lite/encodings');
iconv.encodings = encodings;
if (process.env.NODE_ENV !== 'test') {
    throw Error('Non-test environment');
}
jest.setTimeout(10000);
