const chai     = require('chai'),
      chaiHttp = require('chai-http'),
      mongoose = require('mongoose'),
      faker    = require('faker'),
      jwt      = require('jsonwebtoken');

const { app, runServer, closeServer }   = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET } = require('config');

const { User }    = require('models/users');
const { Comment } = require('models/comments');

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

// Creates user and adds to db
function seedUserData(username, password, email) {
    console.log('Seeding user data');
    return User.hashPassword(password).then(password => {
        const seedData = {
            username,
            password,
            email
        };
        return User.create(seedData);
    });
}

// seeds db with comments
function seedCommentData() {
    console.log('Seeding comments data');
    const comments = [];
    for(let i=0; i<5; i++) {
        comments.push({
            currency: 'btc',
            content: faker.lorem.paragraph(),
            author: mongoose.Types.ObjectId()
        });
    }
    return Comment.insertMany(comments);
}

// tears down db after each test completes
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('/comments API resource', function(){
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
        return seedUserData(username, password, email)
            .then(() =>  {
                return seedCommentData();
            });
    });

    afterEach(function() {
        return tearDownDb();
    });

    describe('GET', () => {
        it('should return all comments in db for BTC', () => {
            return chai.request(app)
                .get('/api/comments/currency/btc')
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.comments[0]).to.include.keys('id', 'currency', 'author', 'content');
                })
                .catch(err => console.log({message: 'Internal server error', err}));
        }); 
    });

    describe('POST', () => {
        it('should add a comment to db', () => {
            const newComment = {
                currency: 'eth',
                content: 'ETH is really coming along'
            };
            let userID;
            return User.findOne({ username })
                .then(user => {
                    userID = user.id;
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
                        .post('/api/comments/currency/eth')
                        .set('authorization', `Bearer ${token}`)
                        .send(newComment)
                })
                .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body.currency).to.equal(newComment.currency);
                    expect(res.body.content).to.equal(newComment.content);
                    expect(res.body.author).to.equal(userID);
                    return Comment.findOne({ _id: res.body.id }).exec()
                })
                .then(comment => {
                    expect(comment.currency).to.equal(newComment.currency);
                    expect(comment.content).to.equal(newComment.content);
                });
        });
                        
        it('should like comment with current user', () => {
            let userID, token;
            return User.findOne({ username })
                .then(user => {
                    userID = user.id;
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
                .then(_token => {
                    token = _token;
                    return Comment.findOne().exec()
                })
                .then(comment => {
                    return chai.request(app)
                        .post(`/api/comments/${comment._id}/likes`)
                        .set('authorization', `Bearer ${token}`)
                })
                .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body.usersLiked).to.include(userID); // make sure user-id from token matches user-id in usersLiked array
                });
        });
    });
});