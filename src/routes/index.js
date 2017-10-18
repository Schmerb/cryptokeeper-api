'use strict';

const bodyParser = require('body-parser'),
      express    = require('express');

const { router: usersRouter  } = require('./usersRouter');
const { router: twilioRouter } = require('./twilioRouter');
const { router: cryptoRouter } = require('./cryptoRouter');
const { router: authRouter   } = require('auth');


module.exports = function(app, passport) {

    app.use('/api/users/', usersRouter);
    app.use('/api/auth/', authRouter);
    app.use('/twilio', twilioRouter);
    app.use('/crypto', cryptoRouter);

    // A protected endpoint which needs a valid JWT to access it
    app.get(
        '/api/protected',
        passport.authenticate('jwt', {session: false}),
        (req, res) => {
            return res.json({
                data: 'rosebud'
            });
        }
    );
}