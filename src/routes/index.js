'use strict';

const bodyParser = require('body-parser'),
      express    = require('express');

const { router: authRouter     } = require('auth');
const { router: usersRouter    } = require('./usersRouter');
const { router: eventsRouter   } = require('./eventsRouter');
const { router: currencyRouter } = require('./currencyRouter');
const { router: twilioRouter   } = require('./twilioRouter');
const { router: cryptoRouter   } = require('./cryptoRouter');

// let auth = null;

function routes(app, authenticate) {
    // console.log('Inside routes/index', authenticate);
    // const authenticate = passport.authenticate('jwt', {session: false});
    // auth(authenticate);

    // auth = authenticate;

    app.use('/api/auth/', authRouter);
    app.use('/api/users/', usersRouter);
    app.use('/api/events/', authenticate, eventsRouter);
    app.use(['/api/currencies/', '/api/currencies/:id'], authenticate, currencyRouter);
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

module.exports = { routes };