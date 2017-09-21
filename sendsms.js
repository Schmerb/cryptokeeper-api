const accountSid = 'ACf1b0cc63dfcbb6dd075115d72b48c61d';
const authToken  = 'fcf851c6f0b2dc70e19482c1603a6e63';

const client = require('twilio')(accountSid, authToken);

console.log('hello');

client.messages.create({
    body: 'Hello from Node',
    to: '+12672278357',  // Text this number
    from: '+16093725347' // From a valid Twilio number
})
.then((message) => console.log('yo ', message.sid));