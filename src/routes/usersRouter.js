'use strict';

const express    = require('express'),
      bodyParser = require('body-parser'),
      passport   = require('passport');

const usersController 	     = require('controllers/usersController');
const { router: fileRouter } = require('./fileRouter');

const router 	   = express.Router();
const jsonParser   = bodyParser.json();
const authenticate = require('services/authenticate').authenticate();



router.route('/')
	.get(authenticate, usersController.getAllUsers) // returns all users
	.post(jsonParser, usersController.addUser); // registers a new user

// router.get('/', authenticate, usersController.getAllUsers) // returns all users
// router.post('/', jsonParser, usersController.addUser); // registers a new user

router.route('/me')
	.all(authenticate)
	.get(usersController.getUser) // gets currenct user from JWT
	.delete(usersController.deleteAccount); // removes user's account

// Updates user's email
router.put('/me/email', [jsonParser, authenticate], usersController.updateEmail);

// Adds/Updates users phone number
router.put('/me/phone-number', [jsonParser, authenticate], usersController.updatePhoneNumber)

// Hanldes storage of avatar profile image uploads
router.use('/me/avatar', authenticate, fileRouter);






module.exports = { router };

