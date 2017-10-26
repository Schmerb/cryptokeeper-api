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
	.put(jsonParser, usersController.updateUser) // updates user's email/phone number
	.delete(usersController.deleteAccount); // removes user's account

// Updates user's base currency
router.put('/me/base-currency', [jsonParser, authenticate], usersController.updateBaseCurrency);

// Hanldes storage of avatar profile image uploads
router.use('/me/avatar', authenticate, fileRouter);






module.exports = { router };

