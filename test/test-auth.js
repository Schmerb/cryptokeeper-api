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

// tears down db after each test completes
// function tearDownDb() {
//     console.warn('Deleting database');
//     return mongoose.connection.dropDatabase();
// }

describe('/users API resource', function () {
    const username  = 'exampleUser',
          password  = 'examplePass',
          email     = 'email@example.com',
          firstName = 'Example',
          lastName  = 'User';

    before(() => {
        return runServer(TEST_DATABASE_URL);
    });

    after(() => {
        return closeServer();
    });

    beforeEach(function () {
        return User.hashPassword(password).then(password =>
            User.create({
                username,
                password,
                email,
                firstName,
                lastName
            })
        );
    });

    afterEach(function () {
        return User.remove({});
    });

    // LOGIN
    describe('/api/auth/login', function () {
        it('Should reject requests with no credentials', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .then(() => expect.fail(null, null, 'Request should not succeed'))
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with incorrect usernames', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .auth('wrongUsername', password)
                .then(() => expect.fail(null, null, 'Request should not succeed'))
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with incorrect passwords', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .auth(username, 'wrongPassword')
                .then(() => expect.fail(null, null, 'Request should not succeed'))
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should return a valid auth token', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .auth(username, password)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const payload = jwt.verify(token, JWT_SECRET, {
                        algorithm: ["HS256"]
                    });
                    expect(payload.user).to.deep.include({
                        username,
                        firstName,
                        lastName
                      });
                })
        });
    });

    // REFRESH
    describe('/api/auth/refresh', function () {
        it('Should reject requests with no credentials', function () {
            return chai.request(app)
                .post('/api/auth/refresh')
                .then(() => expect.fail(null, null, 'Request should not succeed'))
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with an invalid token', function () {
            const token = jwt.sign({
                username,
                firstName,
                lastName
            }, 'wrongSecret', {
                    algorithm: 'HS256',
                    expiresIn: '7d'
                });

            return chai.request(app)
                .post('/api/auth/refresh')
                .set('Authorization', `Bearer ${token}`)
                .then(() => expect.fail(null, null, 'Request should not succeed'))
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with an expired token', function () {
            const token = jwt.sign({
                user: {
                    username,
                    firstName,
                    lastName
                },
                exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
            }, JWT_SECRET, {
                    algorithm: 'HS256',
                    subject: username
                });

            return chai.request(app)
                .post('/api/auth/refresh')
                .set('authorization', `Bearer ${token}`)
                .then(() => expect.fail(null, null, 'Request should not succeed'))
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should return a valid auth token with a newer expiry date', function () {
            const token = jwt.sign({
                user: {
                    username,
                    firstName,
                    lastName
                },
            }, JWT_SECRET, {
                    algorithm: 'HS256',
                    subject: username,
                    expiresIn: '7d'
                });
            const decoded = jwt.decode(token);

            return chai.request(app)
                .post('/api/auth/refresh')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const payload = jwt.verify(token, JWT_SECRET, {
                        algorithm: ["HS256"]
                    });
                    expect(payload.user).to.deep.equal({
                        username,
                        firstName,
                        lastName
                    });
                    expect(payload.exp).to.be.at.least(decoded.exp);
                });
        });
    });
}); 