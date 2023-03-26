const razorpayRequest = (
    beneficiaryName,
    email,
    ifscCode,
    accountNumber
) => {
    var headers = {
        'Content-type': 'application/json'
    };
    var dataString = {
        name: `${beneficiaryName}`,
        email: `${email}`,
        tnc_accepted: true,
        account_details: {
            business_name: `CLP-CONNECT`,
            business_type: 'individual'
        },
        bank_account: {
            ifsc_code: `${ifscCode}`,
            beneficiary_name: `${beneficiaryName}`,
            account_type: 'savings',
            account_number: `${accountNumber}`
        }
    };

    var options = {
        uri: 'https://api.razorpay.com/v1/beta/accounts',
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dataString),
        auth: {
            user: `${process.env.RAZORPAY_KEY_ID}`,
            pass: `${process.env.RAZORPAY_KEY_SECRET}`
        }
    };
    return options;
};
export default razorpayRequest;
