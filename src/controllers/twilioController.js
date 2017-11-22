'use strict';

const request = require('request');

const config     = require('config'),
      accountSid = config.TWILIO_ACCOUNT_SID,
      authToken  = config.TWILIO_AUTH_TOKEN,
      authyKey   = config.TWILIO_AUTHY_KEY;



// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Requests verification code
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.requestVerificationCode = (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const options = {
        method: 'POST', 
        url: 'https://api.authy.com/protected/json/phones/verification/start', 
        json: true,
        form: {
            'api_key': authyKey,
            'country_code': 1,
            'phone_number': phoneNumber,
            'via': 'sms'
        }
    }; 
    request(options, (err, _res, body) => {
        console.log('TWILIO res body: ', body);
        res.send(body);
    });
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Verifies code sent to user
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.verifyCode = (req, res) => {
    const { phoneNumber, code } = req.params;
    const options = {
        method: 'GET', 
        url: 'https://api.authy.com/protected/json/phones/verification/check', 
        json: true,
        form: {
            'api_key': authyKey,
            'country_code': 1,
            'phone_number': phoneNumber,
            'verification_code': code
        }
    }; 
    request(options, (err, _res, body) => {
        console.log('TWILIO res body: ', body);
        res.send(body);
    });
};
