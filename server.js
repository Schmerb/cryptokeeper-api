'use strict';

require('dotenv').config();
const bodyParser = require('body-parser'),
      express    = require('express'),
      mongoose   = require('mongoose'),
      morgan     = require('morgan'),
      passport   = require('passport');
     

// Here we use destructuring assignment with renaming so the two variables
// called router (from ./users and ./auth) have different names
// For example:
// const actorSurnames = { james: "Stewart", robert: "De Niro" };
// const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james
// console.log(bobby); // De Niro - the variable name is bobby, not robert
const {router: usersRouter} = require('./users');
const {router: twilioRouter} = require('./twilio');
const {
    router: authRouter, 
    basicStrategy, 
    jwtStrategy
} = require('./auth');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

const app = express(); 

// SOCKET.IO 
const httpServer = require('http').Server(app);
require('./services/live-chat')(httpServer);


// LOGGING
app.use(morgan('common'));

// CORS
app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
      if (req.method === 'OPTIONS') {
          return res.sendStatus(204);
      }
      next();
});

app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/twilio', twilioRouter);

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
