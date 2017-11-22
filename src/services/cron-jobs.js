const cron = require('node-cron');

const validateEvents = require('./validate-events');
const { getPrices }  = require('services/crypto-prices');
const { User }       = require('models/users');

const base = process.hrtime();
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Task that runs every X minutes to get current coin prices
// and check each user event condition 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
const eventsTask = cron.schedule('*/20 * * * * *', () => {
    let t = process.hrtime();
    // console.log('running a task every 5s');
    // console.log(`it has been ${t[0] - base[0]}s since first run`);
    getPrices(validate); // get prices and use callback to validate 
                         // events against new prices
});
eventsTask.start();


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Used as a callback to async request
// Gets all users with events and calls validation function
// on the events passing in currenct coin prices. 
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function validate(prices) {
    // console.log(prices);
    // Loop through every event for everyt user and print event
    return User
        .find({
            "events.0": { $exists: true }
        })
        .exec()
        .then(users => validateEvents(users, prices))
        .catch(err => console.log('ERROR:', err));
}