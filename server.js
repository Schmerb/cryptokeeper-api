'use strict';

require('dotenv').config();
const bodyParser = require('body-parser'),
      express    = require('express'),
      mongoose   = require('mongoose'),
      morgan     = require('morgan'),
      passport   = require('passport'),
      cors       = require('cors'),
      busboyBodyParser = require('busboy-body-parser');
     
const {
    basicStrategy, 
    jwtStrategy
} = require('auth');

// CONFIG
mongoose.Promise = global.Promise;
const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require('config');


// EXPRESS INSTANCE
const app = express(); 

// CRON jobs
require('services/cron-jobs');

// SOCKET.IO 
const httpServer = require('http').Server(app);
require('services/live-chat')(httpServer);
// require('services/crypto-prices')(httpServer);

// LOGGING
app.use(morgan('common'));


// CORS
app.use(
    cors({
        origin: [  // Whitelist 
            CLIENT_ORIGIN,
            'http://www.cryptokeeper.co',
            'http://192.168.1.112:3000',
            'http://172.20.10.2:3000',
            'http://localhost:3000'
        ]
    })
);

app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
      if (req.method === 'OPTIONS') {
          return res.sendStatus(204);
      }
      next();
});

// MIDDLEWARE
app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);

require('services/authenticate').init(passport);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboyBodyParser({ limit: '10mb' })); // required for gridFS file store 


// ROUTES
const { routes } = require('routes');
routes(app);

// Fallback for all non-valid endpoints
app.use('*', (req, res) => {
    return res.status(404).json({message: 'Not Found'});
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = httpServer
                .listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
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




module.exports = { app, runServer, closeServer, passport };
