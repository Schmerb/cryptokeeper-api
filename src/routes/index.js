'use strict';

const bodyParser = require('body-parser'),
      express    = require('express');

const { router: authRouter     } = require('auth');
const { router: usersRouter    } = require('./usersRouter');
const { router: eventsRouter   } = require('./eventsRouter');
const { router: currencyRouter } = require('./currencyRouter');
const { router: commentsRouter } = require('./commentsRouter');
const { router: twilioRouter   } = require('./twilioRouter');
const { router: cryptoRouter   } = require('./cryptoRouter');


const authenticate = require('services/authenticate').authenticate();

function routes(app) {

    app.use('/api/auth/', authRouter);
    app.use(['/api/users/', '/api/users/me'], usersRouter);
    app.use('/api/events/', authenticate, eventsRouter);
    app.use(['/api/currencies/', '/api/currencies/:id'], authenticate, currencyRouter);
    app.use('/api/comments', commentsRouter);
    app.use('/api/twilio', twilioRouter);
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