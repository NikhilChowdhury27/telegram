import UserRepository from '../../../repository/user.repository';
import CommonService from '../../../utils/common.service';
import {
    BAD_CLIENT_REQUEST_400,
    INVALID_OTP,
    LOGIN_SUCCESSFULL,
    SUCCESS_200
    // ACCEPTED
} from '../../../../config/constants/errorMessages';
import OTP from '../../../utils/otp/otp';
import FreshchatService from '../../../utils/freshchat/freshchat.service';
import { IUserRegisterPayload, IVerifyOtp } from '../user.interface';
import { sign, SignOptions } from 'jsonwebtoken';
import { byPassNumbers } from '../../../../config/constant';
import User from '../../../../models/User';

class AuthService extends CommonService {
    async getOtp(
        mobile,
        whatsappComm?: boolean,
        type?: string,
        groupId?: string
    ) {
        let hash = '';
        try {
            const otpToSend = OTP.generateOTP();
            if (byPassNumbers.indexOf(mobile) == -1) {
                if (
                    !type ||
                    type == 'telegramChannel' ||
                    type == 'telegramExisting'
                ) {
                    await OTP.sendSmsOTP(
                        mobile,
                        otpToSend,
                        10,
                        process.env.MSG91_SENDER_ID_OTP
                    );
                }
                if (
                    whatsappComm ||
                    type == 'whatsappGroup' ||
                    type == 'whatsappCommunity'
                ) {
                    FreshchatService.sendOtpFreshchatServiceRequest(
                        otpToSend.toString(),
                        mobile,
                        groupId || null
                    );
                }
            }
            hash = OTP.generateOTPHash(otpToSend.toString(), mobile);
            return {
                statusCode: 200,
                message: SUCCESS_200,
                data: { sessionId: hash }
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async verifyOtp(verifyOtpPayload: IVerifyOtp) {
        try {
            const { otp, sessionId, mobile, whatsappStatus } = verifyOtpPayload;
            let isValidOTP = true;
            if (byPassNumbers.indexOf(mobile) == -1) {
                isValidOTP = OTP.validateOTP(otp, mobile, sessionId);
            }
            if (isValidOTP) {
                const filter = { mobile: mobile };
                const projection = [
                    'id',
                    'name',
                    'email',
                    'mobile',
                    'telegramUsername',
                    'state'
                ];

                const userData = await UserRepository.findUser(
                    filter,
                    projection
                );
                if (userData && userData.length) {
                    const payload = {
                        id: userData[0].id,
                        name: userData[0].name,
                        email: userData[0].email,
                        mobile: userData[0].mobile
                    };
                    const token = sign(payload, process.env.TOKEN_SECRET, <
                        SignOptions
                    >{
                        expiresIn: process.env.TOKEN_EXPIRY_DURATION,
                        algorithm: process.env.ACCESS_TOKEN_ALGO
                    });
                    await User.update(
                        {
                            whatsappStatus: whatsappStatus
                        },
                        {
                            where: {
                                mobile: userData[0].mobile
                            }
                        }
                    );
                    return {
                        statusCode: 200,
                        message: LOGIN_SUCCESSFULL,
                        data: {
                            token,
                            exists: 1,
                            landing_url: process.env.PAYMENT_DOMAIN + '?token=',
                            name: userData[0].name,
                            email: userData[0].email,
                            state: userData[0].state
                        }
                    };
                }
                return {
                    statusCode: 200,
                    message: SUCCESS_200,
                    data: { exists: 0 }
                };
            }
            return {
                statusCode: 400,
                message: INVALID_OTP,
                data: {}
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async register(userRegisterPayload: IUserRegisterPayload) {
        try {
            if (
                byPassNumbers.indexOf(userRegisterPayload.contact.mobile) == -1
            ) {
                if (
                    !OTP.validateOTP(
                        userRegisterPayload.otp,
                        userRegisterPayload.contact.mobile,
                        userRegisterPayload.sessionId
                    )
                ) {
                    return {
                        statusCode: 400,
                        message: BAD_CLIENT_REQUEST_400,
                        data: {}
                    };
                }
            }
            // const telegramUserRes: any =
            //     await Telegram.findUserDetailsOnTelegram({
            //         telegramMobileNo: userRegisterPayload.contact.mobile
            //     });
            // if (!telegramUserRes) {
            //     return {
            //         statusCode: 400,
            //         message: 'Telegram User Not Found',
            //         data: {}
            //     };
            // }
            // if (userRegisterPayload.contact.mobile != telegramUserRes.phone) {
            //     return {
            //         statusCode: 202,
            //         message: ACCEPTED,
            //         data: { telegramUserRes }
            //     };
            // }
            const userCreateData = {
                name: userRegisterPayload.name,
                mobile: userRegisterPayload.contact.mobile,
                email: userRegisterPayload.contact.email,
                whatsappStatus: userRegisterPayload.whatsappStatus,
                state: userRegisterPayload.state || null
                // telegramUserId: undefined,
                // telegramAccessHash: undefined
            };
            console.log('userCreateData :; ', userCreateData);
            const { id, email, name, mobile } = await UserRepository.createUser(
                userCreateData
            );

            const payload = {
                id,
                email,
                mobile,
                name
            };
            const token = sign(payload, process.env.TOKEN_SECRET, <SignOptions>{
                expiresIn: process.env.TOKEN_EXPIRY_DURATION,
                algorithm: process.env.ACCESS_TOKEN_ALGO
            });

            return {
                statusCode: 200,
                message: SUCCESS_200,
                data: {
                    token,
                    landing_url: process.env.PAYMENT_DOMAIN + '?token='
                }
            };
        } catch (error) {
            if (error.message === 'SequelizeUniqueConstraintError') {
                return {
                    statusCode: 400,
                    message:
                        'This email id is already registered with us. Please enter a different email id to proceed'
                };
            }
            throw new Error(error);
        }
    }
}

export default new AuthService();
