const { MAILGUN_API_KEY } = require('../config');

const domain = 'mail.cryptokeeper.co';
const mailgun = require('mailgun-js')({apiKey: MAILGUN_API_KEY, domain: domain});


module.exports = (data) => {
    const { email, username, message, name, currentPrice, currency } = data;

    var data = {
        from: 'CryptoKeeper Services <support@mail.cryptokeeper.co>',
        to: email,
        subject: `Event Alert: ${name}`,
        // text: message,
        html:   `<html>
                    <h3>Hey ${username}!</h3>
                    <p style="font-size:20px;padding:10px;border:1px solid grey;text-align:center;">${message}</p>
                    <p>Currency: ${currency}, Current Price: <b>$${currentPrice}</b></p>
                    <p>Checkout the current market --> <a href="www.cryptokeeper.co">Go To My Account</a></p>
                    <p style="font-size:12px;">Do Not reply to this email</p>
                </html>`
    };
    
    mailgun.messages().send(data, (error, body) => {
        if(error) 
            return console.log('Error: ', error);
            
        console.log('Email Sent: ');
        console.log(body);
    });
};