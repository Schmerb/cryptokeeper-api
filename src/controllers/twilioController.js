'use strict';

const request = require('request');

const config     = require('config'),
      accountSid = config.TWILIO_ACCOUNT_SID,
      authToken  = config.TWILIO_AUTH_TOKEN,
      authyKey   = 'VIahCfvG3EScZa8zgbwQuksBNv93KsAp';

const client = require('twilio')(accountSid, authToken);

exports.sendTextMessage = (req, res) => {
    let num = req.params.num;
    // let other = req.query.number;
    // console.log(num, other)
    console.log('hello');
    client.messages.create({
        body: 'Hello from Node',
        to: '+12672278357',  // Text this number
        from: '+16093725347' // From a valid Twilio number
    })
    .then((message) => console.log('yo ', message.sid));
    res.send('SENT');
};

function sendMessage(number) {
    client.messages.create({
        body: "This is a dope feature to have in a cryptocurrency tracking application",
        to: `+12672278357`,
        from: "+16093725347"
    }, function(err, message) {
        console.log(message);
    });
}

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
