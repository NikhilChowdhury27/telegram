var jwt = require('jsonwebtoken');
import { AUTH_TOKEN } from '../config/constant';
import sendResponse from '../app/utils/sendResponse';

const isAuthenticated = async (req, res, next) => {
    // check if request already has user details
    if (req.user) {
        req.isAuthenticated = true;
        return next();
    }

    req.isAuthenticated = false;
    let token = req.header('x-access-token') || req.query['x-access-token'];
    try {
        if (!token) {
            return sendResponse(
                req,
                res,
                401,
                [{ tokenExpired: 0 }],
                AUTH_TOKEN.TOKEN_MISSING_400
            );
        }
        const decoded: any = await jwt.verify(token, process.env.TOKEN_SECRET);
        // check if this is a service access token
        if (!decoded.id) {
            console.warn('Unable to find user Id in access token', token);
            return sendResponse(
                req,
                res,
                401,
                [{ tokenExpired: 1 }],
                AUTH_TOKEN.TOKEN_INVALID_401
            );
        }
        req.user = decoded;
        next();
    } catch (err) {
        return sendResponse(
            req,
            res,
            401,
            [{ tokenExpired: 0 }],
            AUTH_TOKEN.TOKEN_ERROR_400
        );
    }
};

export default isAuthenticated;
