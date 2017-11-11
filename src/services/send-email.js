const request = require('request');

// module.exports = (data) => {
//     const { email, username } = data;
//     let URL = `https://formspree.io/${email}`;
// };

const api_key = 'key-f797305e0f59c3eedc0c041ee92f5ee8';
const domain = 'https://app.mailgun.com/app/domains/sandbox6f0afaf4955544129e017b147787a352.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

var data = {
    from: 'Excited User <me@samples.mailgun.org>',
    to: 'mikeschmerbeck@gmail.com',
    subject: 'Hello',
    text: 'Testing some Mailgun awesomness!'
};
   
mailgun.messages().send(data, function (error, body) {
    console.log(body);
});