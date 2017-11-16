const { User } = require('models/users');

const twilio    = require('./twilio');
// const sendEmail = require('./send-email');

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// gets event objects from users and runs validation 
// checks on each event condition 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
module.exports = (users, prices) => {

    users.forEach(user => {
        const { events } = user;
        events.forEach(event => {
            if(!event.successful) {
                // validate(user, event, prices);
            } else {
                console.log('EVENT ALREADY SUCCESSFUL');
            }
            // used for testing
            // validate(user, event, prices);
        });
    });
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
// function that validates condition
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
function validate(user, event, prices) {
    const { username, email, phoneNumber } = user;
    console.log('\n\n');
    console.log(username);
    console.log(email || '{no email}');
    console.log(phoneNumber || '{no number}');

    console.log('EVENT:');
    console.group();
    console.log(JSON.stringify(event, null, 3));
    console.groupEnd();

    // 1) get current coin price
    // 2) get base currency price
    // 3) form condition from event object

    let { currency, basePrice, type, condition, value, valueType, message } = event;
    // gets the matching currency price
    let price = getCurrencyPrice(prices, currency);
    console.log('PRICE: ', price);
    switch(condition) {
        case 'reach':
            if(price >= value) {
                console.log('SUCCESS! ', message);
                sendAlert(username, email, phoneNumber, event);
                // send sms & email
            }
            break;
        case 'dropTo':
            if(price <= value) {
                console.log('SUCCESS! ', message);
                sendAlert(username, email, phoneNumber, event);
                // send sms & email
            }
            break;
        case 'decrease':
            if(valueType === '$') {
                if(basePrice - price >= value) {
                    console.log('SUCCESS! ', message);
                    // send sms & email
                    sendAlert(username, email, phoneNumber, event);
                }
            } else { // valueType === %
                let diff = (price / basePrice) * 100;
                console.log('diff: ', diff);
                console.log('decr: ', 100 - diff);
                if(100 - diff >= value) {
                    console.log('SUCCESS! ', message);
                    // send sms & email
                    sendAlert(username, email, phoneNumber, event);
                }
            }
            break;
        case 'increase':
            if(valueType === '$') {
                if(price - basePrice >= value) {
                    console.log('SUCCESS! ', message);
                    // send sms & email
                    sendAlert(username, email, phoneNumber, event);
                }
            } else {
                let diff = (price / basePrice) * 100;
                console.log('diff: ', diff);
                console.log('incr: ', diff - 100);
                if(diff - 100 >= value) {
                    console.log('SUCCESS! ', message);
                    // send sms & email
                    sendAlert(username, email, phoneNumber, event);
                }
            }
            break;
    }
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Looks through prices for matching currency and returns
// that value   
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function getCurrencyPrice(prices, currency) {
    for(let coin of prices) {
        if(coin.hasOwnProperty(currency)) {
            return coin.USD;
        }
    }
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Sends correct alert type, either SMS Twilio text message
// or email
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function sendAlert(username, email, phoneNumber, event) {
    let { name, currency, basePrice, type, condition, value, valueType, message, _id: id } = event;
    if(type.sms) {
        // sends SMS
        console.log('SMS');
        console.log('user: ', username);
        console.log('phone: ', phoneNumber);
        console.log(message);
        twilio({phoneNumber, message});
    }
    if(type.email) {
        // sends email
        console.log('Email');
        console.log('user: ', username);
        console.log('email: ', email);
        console.log(message);
        // sendEmail({email, message});
    }

    // grab event in db and update it as successful
    console.log('EventID:', id);
    return User
        .findOneAndUpdate(
            {"events._id": id},
            {$set: {"events.$.successful": true}},
            {new: true}
        )
        .then(updatedUser => {
            console.log(updatedUser.events.id(id));
        })
        .catch(err => console.log(err));
}