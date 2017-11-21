'use strict';

const request = require('request');

const config     = require('config'),
      accountSid = config.TWILIO_ACCOUNT_SID,
      authToken  = config.TWILIO_AUTH_TOKEN;

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

exports.requestVerificationCode = (req, res) => {
    const phoneNumber = req.param.phoneNumber;
    const VERIFICATION_URL = 'https://ugliest-society-9291.twil.io/start?';
    request();
};
