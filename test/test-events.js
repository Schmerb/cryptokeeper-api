const chai     = require('chai'),
      chaiHttp = require('chai-http'),
      mongoose = require('mongoose'),
      jwt      = require('jsonwebtoken');

const { app, runServer, closeServer }   = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET } = require('config');
const { User } = require('models/users');

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);
chai.use(require('chai-like')); // needs to come before chai-things
chai.use(require('chai-things'));

// Seeds a user with events
function seedUserData(username, password, email) {
    console.log('Seeding user data');
    return User.hashPassword(password).then(password => {
        const seedData = {
            username,
            password,
            email,
            events: [
                {
                    name: 'BTC reached 6K!',
                    currency: 'BTC',
                    type: {
                        sms: true,
                        email: true
                    },
                    condition: 'Reached',
                    value: 6000,
                    valueType: '$',
                    message: 'Bitcoin just reached 6K! SELL!!'
                },
                {
                    name: 'ETH reached 6K!',
                    currency: 'ETH',
                    type: {
                        sms: true,
                        email: true
                    },
                    condition: 'increased',
                    value: 10,
                    valueType: '%',
                    message: 'Ethereum just increased 10%, SELL!'
                }
            ]
        };
        User.create(seedData);
    });
}

// tears down db after each test completes
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('/events API resource', function() {
    const username = 'user',
          password = 'passwordpass',
          email    = 'user@example.com';

    before(() => {
        console.log(TEST_DATABASE_URL);
        return runServer(TEST_DATABASE_URL);
    });

    after(() => {
        return closeServer();
    });

    beforeEach(function () {
        return seedUserData(username, password, email);
    });

    afterEach(function() {
        return tearDownDb();
    });

    describe('GET', function() {
        it('Should send protected data', function() {
            // 1) lookup user to get id
            // 2) sign token with user/email/pass/id
            // 3) make request to /api/events with auth header
            return User.findOne({ username })
                .then(user => {
                    return jwt.sign({
                        user: {
                          username,
                          password,
                          email,
                          id: user.id
                        },
                      }, JWT_SECRET, {
                        algorithm: 'HS256',
                        subject: username,
                        expiresIn: '7d'
                      });
                })
                .then(token => {
                    return chai.request(app)
                      .get('/api/events')
                      .set('authorization', `Bearer ${token}`)
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                });
          });
    });

    describe('POST', function() {
        it('should add an event', function() {
            // 1) create event object
            // 2) lookup user to get id
            // 3) sign token with user/email/pass/id
            // 4) make request to /api/events with auth header
            //     - sending the event in req.body
            const newEvent = {
                name: 'DOGECOIN is increasing in price', 
                currency: 'DOGECOIN', 
                type: {
                    sms: true,
                    email: true
                },
                basePrice: 90,
                condition: 'increased', 
                value: 100, 
                valueType: '$', 
                message: 'DOGECOIN increaeed by $100!!'
            };
            return User.findOne({ username })
                .then(user => {
                    return jwt.sign({
                        user: {
                          username,
                          password,
                          email,
                          id: user.id
                        },
                      }, JWT_SECRET, {
                        algorithm: 'HS256',
                        subject: username,
                        expiresIn: '7d'
                      });
                })
                .then(token => {
                    return chai.request(app)
                        .post('/api/events')
                        .set('authorization', `Bearer ${token}`)
                        .send(newEvent)
                })
                .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.deep.include(newEvent);
                    // expect(res.body).to.be.an('Object').that.contains.something.like(newEvent);
                })
        });
    })
});