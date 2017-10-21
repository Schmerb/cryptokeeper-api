'use strict';

const express    = require('express'),
      bodyParser = require('body-parser'),
      passport   = require('passport');

// const { auth } = require('./index');
// console.log('Inside usersROUTER', auth);
const usersController = require('controllers/usersController');

const router = express.Router();

const jsonParser = bodyParser.json();

const authenticate = passport.authenticate('jwt', {session: false});


// Post to register a new user
router.post('/', jsonParser, usersController.addUser);

// Post to add user's mobile phone number
router.post('/me/add-phone-number', jsonParser, usersController.addPhoneNumber);

// returns all users
router.get('/',authenticate, usersController.getAllUsers);

router.get('/me', usersController.getUser);

module.exports = { router };

