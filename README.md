# CryptoKeeper (API)
Fullstack (React) Capstone Project from [Thinkful's](https://www.thinkful.com/) Fullstack Web Development program. 

## Project Requirements

Project Must:

* Do something interesting or useful.
* Be a fullstack app using HTML, CSS, React, Node, Express, and Mongoose.
* The client and API should be deployed separately and stored in separate GitHub repos.
* Both client- and server-side code should be tested, and you should use TravisCI for continuous integration and deployment.
* Your app should be responsive, and should work just as well on mobile devices as it does on desktop devices.
* All code should be high quality, error free, commented as necessary, and clean.
* The styling on your client should be polished.
* Your app should have a landing page that explains what the app does and how to get started, in addition to pages required to deliver the main functionality.
* provide DEMO account credentials

## Live [DEMO](https://www.cryptokeeper.co/)
* username: demo
* password: demopassword

## Description
CryptoKeeper is a cryptocurrency tracking application using real-time market data via [Socket.IO](https://socket.io/) and [Cryptocompare](https://www.cryptocompare.com/). The current cryptocurrencies tend be quite volatile compared to more traditional currencies and stocks with prices sometimes dropping or increasing drastically in a matter of hours. By registering for an account, users can overcome the uncertaintity of keeping up with the market by creating custom events to monitor a given currency for a specific condition.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
(e.g. Bitcoin just reached $12k, Ethereum dropped 5%) 

If and when a condition is eventually met, a notification will be sent to the user via text message and/or email indicating the current price. User's have control over each event condition as well as the method of deilvery and custom message that will be displayed with the notification.

This API provides services to send notifications as text messages via [Twilio](https://www.twilio.com/) and emails via [Mailgun](https://www.mailgun.com/). It also handles user authentication using [Passport.js](http://passportjs.org/docs) and JWT auth tokens

## Technology
* Production: 
    * [Node.js](https://nodejs.org/en/)
    * [Express.js](https://expressjs.com/)
    * [MongoDB](https://www.mongodb.com/)
    * [Mongoose.js](http://mongoosejs.com/)
    * [GridFS](https://docs.mongodb.com/manual/core/gridfs/)
    * [Passport.js](http://passportjs.org/docs)
    * [bcryptjs](https://www.npmjs.com/package/bcryptjs)
    * [Socket.IO](https://socket.io/)
    * [node-cron](https://github.com/kelektiv/node-cron)
    * [twilio.js](https://www.npmjs.com/package/twilio)
    * [mailgun-js](https://www.npmjs.com/package/mailgun-js)
* Development:
    * [Mocha.js](https://mochajs.org/)
        * A JavaScript test framework running on Node.js and in the browser, handles asynchronous testing with ease
    * [Chaijs](http://chaijs.com/)
        * A BDD / TDD assertion library for node and the browser, works seamlessly with Mocha testing framework among others
        * [chai-http](http://chaijs.com/plugins/chai-http/) 
            * A plugin for Chaijs that integrates HTTP testing with Chai assertions
    * [faker.js](https://github.com/marak/Faker.js/)
        * Node package, JavaScript library that generates fake data to be used in testing API
    * [TravisCI](https://travis-ci.org/)
        * Continuous Integration testing that tests latest build before deploying to production environment
    * [Gulp](https://gulpjs.com/)
        * Task manager
        * [gulp-nodemon](https://www.npmjs.com/package/gulp-nodemon) 
            * Node package that restarts server and made for use with Gulp tasks
    * [Browsersync](https://www.browsersync.io/)
        * Automation tool to make the development process faster. 
        * Allows for multiple screens to reload live and all interactions are in synchronization, mirroring actions across every browser on any device located on local network.
        * compatible with Gulp
    * Gulp + gulp-nodemon + Browsersync combine to streamline the entire development process