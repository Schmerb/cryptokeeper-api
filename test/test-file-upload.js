// const chai     = require('chai'),
//       chaiHttp = require('chai-http'),
//       mongoose = require('mongoose'),
//       jwt      = require('jsonwebtoken'),
//       fs       = require('fs');

// const { app, runServer, closeServer }   = require('../server');
// const { TEST_DATABASE_URL, JWT_SECRET } = require('config');
// const { User } = require('models/users');

// const should = chai.should();
// const expect = chai.expect;

// chai.use(chaiHttp);

// // Seeds a user 
// function seedUserData(username, password, email) {
//     console.log('Seeding user data');
//     return User.hashPassword(password).then(password => {
//         const seedData = {
//             username,
//             password,
//             email,
//             avatar: ''
//         };
//         User.create(seedData);
//     });
// }

// // tears down db after each test completes
// function tearDownDb() {
//     console.warn('Deleting database');
//     return mongoose.connection.dropDatabase();
// }

// describe('/avatar API resource', function() {
//     const username = 'user',
//           password = 'passwordpass',
//           email    = 'user@example.com';

//     before(() => {
//         console.log(TEST_DATABASE_URL);
//         return runServer(TEST_DATABASE_URL);
//     });

//     after(() => {
//         return closeServer();
//     });

//     beforeEach(() => {
//         return seedUserData(username, password, email);
//     });

//     afterEach(() => {
//         return tearDownDb();
//     });

//     describe('POST', function() {
//         it('should upload an image', function() {
//             // 1) lookup user to get id
//             // 2) sign token with user/email/pass/id
//             // 3) make request to /api/users/me/avatar with auth header
//             //    sending an image file
//             return User.findOne({ username })
//                 .then(user => {
//                     return jwt.sign({
//                         user: {
//                         username,
//                         password,
//                         email,
//                         id: user.id
//                         },
//                     }, JWT_SECRET, {
//                         algorithm: 'HS256',
//                         subject: username,
//                         expiresIn: '7d'
//                     });
//                 })
//                 .then(token => {
//                     let fileName = 'binary-script-compressor.jpg';
//                     console.log(__dirname + '/' + fileName);
//                     return chai.request(app)
//                         .post('/api/users/me/avatar')
//                         .attach('file', fs.readFileSync(__dirname + '/' + fileName), fileName)
//                         .set('authorization', `Bearer ${token}`);
//                 })
//                 .then(res => {
//                     // console.log(res);
//                     expect(res).to.have.status(201);
//                 });
//         });
//     });
// });


