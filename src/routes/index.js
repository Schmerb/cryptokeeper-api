'use strict';

const bodyParser = require('body-parser'),
      express    = require('express');

const { router: usersRouter    } = require('./usersRouter');
const { router: authRouter     } = require('auth');
const { router: eventsRouter   } = require('./eventsRouter');
const { router: currencyRouter } = require('./currencyRouter');
const { router: twilioRouter   } = require('./twilioRouter');
const { router: cryptoRouter   } = require('./cryptoRouter');


module.exports = function(app, passport) {

    const authenticate = passport.authenticate('jwt', {session: false});

    app.use('/api/users/', usersRouter);
    app.use('/api/auth/', authRouter);
    app.use('/api/events/', authenticate, eventsRouter);
    app.use('/api/currencies/', authenticate, currencyRouter);
    app.use('/twilio', twilioRouter);
    app.use('/crypto', cryptoRouter);

    // A protected endpoint which needs a valid JWT to access it
    app.get(
        '/api/protected',
        authenticate,
        (req, res) => {
            console.log(req.user);
            return res.json({
                data: 'rosebud'
            });
        }
    );
}