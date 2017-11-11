'use strict';

const config     = require('config'),
      accountSid = config.TWILIO_ACCOUNT_SID,
      authToken  = config.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

module.exports = (data) => {
    const { phoneNumber, message } = data;
    
    // client.messages.create({
    //     body: message,
    //     to: `+1${phoneNumber}`,  // Text this number
    //     from: '+16093725347' // From a valid Twilio number
    // })
    // .then((message) => console.log('yo ', message.sid));
};