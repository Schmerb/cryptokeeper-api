'use strict';

const config     = require('config'),
      accountSid = config.TWILIO_ACCOUNT_SID,
      authToken  = config.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber = config.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

module.exports = (data) => {
    const { phoneNumber, message, currentPrice, currency, username } = data;
    
    let body = `Hey ${username}!\n\n` +
                `${message}\n\n` +
                `Currency: ${currency}\n` + 
                `Current Price: ${currentPrice}\n\n` +
                `Checkout the current market --> www.cryptokeeper.co`;

    client.messages.create({
        body: body,
        to: `+1${phoneNumber}`,  // Text this number
        from: twilioPhoneNumber // From a valid Twilio number
    })
    .then((message) => console.log('yo ', message.sid));
};