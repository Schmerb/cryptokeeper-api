'use strict';

require('dotenv').config();
const bodyParser = require('body-parser'),
      express    = require('express'),
      mongoose   = require('mongoose'),
      morgan     = require('morgan'),
      passport   = require('passport'),
      cors       = require('cors');
     

const { router: usersRouter }  = require('./users');
const { router: twilioRouter } = require('./twilio');
const { router: cryptoRouter } = require('./crypto');
const {
    router: authRouter, 
    basicStrategy, 
    jwtStrategy
} = require('./auth');

// CONFIG
mongoose.Promise = global.Promise;
const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require('./config');

// Create Express Instance
const app = express(); 

// SOCKET.IO 
const httpServer = require('http').Server(app);
require('./services/live-chat')(httpServer);
require('./services/crypto-prices')(httpServer);

// LOGGING
app.use(morgan('common'));

// CORS
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);
// app.use(function(req, res, next) {
//       res.header('Access-Control-Allow-Origin', '*');
//       res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//       res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
//       if (req.method === 'OPTIONS') {
//           return res.sendStatus(204);
//       }
//       next();
// });

// MIDDLEWARE
app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);

// ROUTERS
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

// Fallback for all non-valid endpoints
app.use('*', (req, res) => {
    return res.status(404).json({message: 'Not Found'});
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
    return new Promise((resolve, reject) => {
        mongoose.connect(DATABASE_URL, err => {
            if (err) {
                return reject(err);
            }
            server = httpServer
                .listen(PORT, () => {
                    console.log(`Your app is listening on port ${PORT}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}




module.exports = {app, runServer, closeServer};
