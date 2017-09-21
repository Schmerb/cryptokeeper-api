const express    = require('express'),
      bodyParser = require('body-parser');
    //   twilio     = require('twilio');

const accountSid = 'ACf1b0cc63dfcbb6dd075115d72b48c61d';
const authToken  = 'fcf851c6f0b2dc70e19482c1603a6e63';

const client = require('twilio')(accountSid, authToken);

const router = express.Router();

router.use(bodyParser.json());


router.get('/', (req, res) => {
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
})


function sendMessage(number) {
    client.messages.create({
        body: "This is a dope feature to have in a cryptocurrency tracking application",
        to: `+12672278357`,
        from: "+16093725347"
    }, function(err, message) {
        console.log(message);
    });
}


module.exports = {router};