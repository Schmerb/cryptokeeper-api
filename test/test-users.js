const chai     = require('chai'),
      chaiHttp = require('chai-http'),
      mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
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

    const usernameB  = 'exampleUserB',
          passwordB  = 'examplePassB',
          emailB     = 'emailB@example.com',
          firstNameB = 'ExampleB',
          lastNameB  = 'UserB';
    
    before(() => {
        console.log(TEST_DATABASE_URL);
        return runServer(TEST_DATABASE_URL);
    });

    after(() => {
        return closeServer();
    });

    beforeEach(function () {
        //
    });

    afterEach(function() {
        return User.remove({});
    });

   

    describe('GET endpoints', () => {
        // it('Should return');
    });

    describe('POST endpoints', () => {
        // Creating new user
        it('should create a new user', function() {
            let res;
            return chai.request(app)
                .post('/api/users')
                .send({
                    username,
                    email,
                    password,
                    firstName,
                    lastName
                })
                .then(_res => {
                    res = _res;
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys('id', 'username', 'email', 'firstName', 'lastName');
                    res.body.email.should.equal(email);
                    res.body.username.should.equal(username);
                    res.body.firstName.should.equal(firstName);
                    res.body.lastName.should.equal(lastName);
                    return User.findById(res.body.id).exec()
                })
                .then(user => {
                    user.username.should.equal(res.body.username);
                    user.email.should.equal(res.body.email);
                    user.firstName.should.equal(res.body.firstName);
                    user.lastName.should.equal(res.body.lastName);
                })
        });
    });
}); 