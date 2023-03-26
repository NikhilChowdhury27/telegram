'use strict';
// import PremiumTutorCreate from '../../api/tutor/controller/tutor.premium.create';
import GetOtp from '../../api/user/controller/get.otp';
import VerifyOTP from '../../api/user/controller/verify.otp';
import RegisterUser from '../../api/user/controller/register.user';
import AddUserBankDetail from '../../api/user/controller/add.user.bank.detail';
import GetUserDetails from '../../api/user/controller/get.user.details';
import isAuthenticated from '../../../middlewares/isAuthenticated';
import UserAppDetails from '../../api/user/controller/user.app.details';
import SaveUserDetails from '../../api/user/controller/save.user.details';
import CheckTelegramUserName from '../../api/user/controller/check.telegram.user.name';
import onboardingData from '../../api/user/controller/onboarding.data';
import GetUserEarnings from '../../api/user/controller/user.earning.dashboard';
import UpdateUserDetails from '../../api/user/controller/update.user';
import AddReceiptDetails from '../../api/user/controller/add.receipt.details';
import AddReceiptDetailsScript from '../../api/user/controller/script.receipt';
import EditReceiptDetails from '../../api/user/controller/edit.receipt';
import GetUserReceiptDetails from '../../api/user/controller/get.receipt.details';

import GetUserDetailsRead from '../../api/user/controller/getUserDetails.read';

const multer = require('multer');

const upload = multer();
import LeadCapture from '../../api/tutor/controller/leads.controller';
import ChangeBankDetailStatus from '../../api/user/controller/change.bank.status';
import GetAllBankDetails from '../../api/user/controller/getAll.bankDetails';
import StatesFetch from '../../api/user/controller/get.states';
import AgreeToBankPolicy from '../../api/user/controller/bank.policy.acceptance';
import AddUserStates from '../../api/user/controller/add.user.states';
import SearchUser from '../../api/user/controller/search.user';
// import MigrateAllBankDetails from '../../api/user/controller/migrate.bank.details';

module.exports = function (app, path = '') {
    // PremiumTutorCreate.post(app, path + '/ums/v1/sudo/tutors/premium', []);
    GetOtp.post(app, path + '/v1/otp/get', []);
    VerifyOTP.post(app, path + '/v1/otp/verify', []);
    RegisterUser.post(app, path + '/v1/register', []);
    AddUserBankDetail.post(app, path + '/v1/add/bank', [isAuthenticated]);
    GetUserDetails.get(app, path + '/user/details', [isAuthenticated]);
    GetUserDetailsRead.get(app, path + '/user/details/read', [isAuthenticated]);
    UserAppDetails.get(app, path + '/app', []);
    SaveUserDetails.put(app, path + '/appDetails', [isAuthenticated]);
    CheckTelegramUserName.get(app, path + '/checkUserName', []);
    onboardingData.get(app, path + '/v1/onboardingData', []);
    GetUserEarnings.get(app, path + '/user/earningDashboard', [
        isAuthenticated
    ]);
    UpdateUserDetails.put(app, path + '/user/update', [isAuthenticated]);
    AddReceiptDetails.post(app, path + '/user/receipt', [isAuthenticated]);

    AddReceiptDetailsScript.post(app, path + '/script/receipt', [upload.any()]);
    // LeadCapture.post(app, path + '/lead/capture', []);
    StatesFetch.get(app, path + '/states', []);
    StatesFetch.get(app, path + '/v1/states', []);
    LeadCapture.post(app, path + '/lead/capture', []);
    ChangeBankDetailStatus.post(app, path + '/user/changeBankDetails', [
        isAuthenticated
    ]);
    GetAllBankDetails.get(app, path + '/user/getBankDetails', [
        isAuthenticated
    ]);
    StatesFetch.get(app, path + '/states', []);

    EditReceiptDetails.put(app, path + '/user/receipt', [isAuthenticated]);
    GetUserReceiptDetails.get(app, path + '/user/receipt', [isAuthenticated]);
    AgreeToBankPolicy.post(app, path + '/user/bankDetailsLogs', [
        isAuthenticated
    ]);
    // MigrateAllBankDetails.post(app, path + '/migrateAllBankDetails', []);
    AddUserStates.post(app, path + '/user/states/script', [isAuthenticated]);
    SearchUser.post(app, path + '/user/search', [isAuthenticated]);
};
