'use strict';

const config = require('./config');
const accountSid = config.TWILIO_ACCOUNT_SID;
const authToken = config.TWILIO_AUTH_TOKEN;

console.log({accountSid, authToken});

console.log(config.JWT_SECRET);

const client = require('twilio')(accountSid, authToken);

console.log('hello');

client.messages.create({
    body: 'Hello from Node',
    to: '+12672278357',  // Text this number
    from: '+16093725347' // From a valid Twilio number
})
.then((message) => console.log('yo ', message.sid));