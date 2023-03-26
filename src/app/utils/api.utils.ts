const axios = require('axios');
import { log } from './error.utils';
const { FORMAT_HTTP_HEADERS } = require('opentracing');
const tinyUrl = require('tinyurl');

/**
 * Make an API Call by passing the payload and inject Tracing headers and context in the process
 * @param url
 * @param payload
 * @param auth
 * @param span
 * @param method
 */
export const apiCall = async function (apiOptions, span) {
    let apiCallSpan = global['tracer'].startSpan('api-call', { childOf: span });

    try {
        apiOptions.headers = apiOptions.headers || {
            Accept: 'application/json;charset=UTF-8'
        };

        apiOptions.responseType = apiOptions.responseType || 'json';

        apiOptions.method = apiOptions.method || 'POST';

        global['tracer'].inject(
            apiCallSpan,
            FORMAT_HTTP_HEADERS,
            apiOptions.headers
        );

        log('info', {
            msg: 'Routing',
            url: apiOptions.url
        });

        let response = await axios(apiOptions);

        apiCallSpan.finish();

        return {
            err: null,
            response: response.data,
            span: apiCallSpan
        };
    } catch (err) {
        log(
            'error',
            {
                message: 'Error in routing url',
                url: apiOptions.url,
                err: err
            },
            apiCallSpan
        );

        apiCallSpan.finish();

        return {
            err: err,
            response: null,
            span: apiCallSpan
        };
    }
};

export const isInvalidField = (fields, invalidFields) => {
    return fields.some((field) => invalidFields.includes(field));
};

export const getDate = (date) => {
    return date.getDate();
};

export const getMonth = (date) => {
    return date.getMonth() + 1;
};

export const getYear = (date) => {
    return date.getFullYear();
};

export const getRoundOfTotalStudents = (num) => {
    let formattedNum;
    if (num > 9 && num < 100) {
        formattedNum =
            Math.sign(num) * (Math.floor(Math.abs(num) / 10) * 10) + '+';
    } else if (num > 99 && num < 1000) {
        formattedNum =
            Math.sign(num) * (Math.floor(Math.abs(num) / 100) * 100) + '+';
    } else if (num > 999 && num < 1000000) {
        formattedNum = Math.sign(num) * Math.floor(Math.abs(num) / 1000) + 'k+';
    } else if (num > 999999 && num < 1000000000) {
        formattedNum =
            Math.sign(num) * Math.floor(Math.abs(num) / 1000000) + 'M+';
    }
    return formattedNum;
};

export const getTinyUrl = async (link) => {
    try {
        return new Promise((resolve, reject) => {
            tinyUrl.shorten(link, function (res, err) {
                if (err) {
                    console.error('Error in creating tiny link', err);
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    } catch (err) {
        console.error('Error shortening link with Tiny', err);
    }
};

export const randomIntFromInterval = (min, max) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const orgForTransactionCount = {
    1: 25,
    8725: 25
};
