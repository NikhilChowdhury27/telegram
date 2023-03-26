const rp = require('request-promise');
import razorpayRequest from './razorpayRequestPayload';

const generateRazorpayAccountId = async (
    beneficiaryName,
    email,
    accountNumber,
    ifscCode,
) => {
    let accountIdObject = null,
        response = null;
    try {
        response = await rp(
            razorpayRequest(
                beneficiaryName,
                email,
                ifscCode,
                accountNumber
            )
        );
        accountIdObject = { accountId: JSON.parse(response).id };
        return accountIdObject;
    } catch (e) {
        let errorDescription = JSON.parse(e.error).error.description;
        let error = new Error(errorDescription);
        error.name = 'ValidationError';
        throw error;
    }
};
export default generateRazorpayAccountId;
