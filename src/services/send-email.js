const { MAILGUN_API_KEY } = require('../config');

const domain = 'mail.cryptokeeper.co';
const mailgun = require('mailgun-js')({apiKey: MAILGUN_API_KEY, domain: domain});


module.exports = (data) => {
    const { email, username, message, name } = data;

    var data = {
        from: 'Account Support <support@mail.cryptokeeper.co>',
        to: email,
        subject: `CryptoKeeper Alert: ${name}`,
        text: message
    };
    
    // mailgun.messages().send(data, (error, body) => {
    //     if(error) 
    //         return console.log('Error: ', error);
            
    //     console.log('Email Sent: ');
    //     console.log(body);
    // });
};


// const domain = 'mail.cryptokeeper.co';
// const mailgun = require('mailgun-js')({apiKey: MAILGUN_API_KEY, domain: domain});

// var data = {
//     from: 'Account Support <support@mail.cryptokeeper.co>',
//     to: 'mikeschmerbeck@gmail.com',
//     subject: 'Hello',
//     text: 'Testing some Mailgun awesomness!'
// };

// mailgun.messages().send(data, function (error, body) {
//     console.log(body);
// });