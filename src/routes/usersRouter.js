'use strict';

const express    = require('express'),
      bodyParser = require('body-parser'),
      passport   = require('passport');


const usersController = require('controllers/usersController');

const router = express.Router();

const jsonParser = bodyParser.json();


// Post to register a new user
router.post('/', jsonParser, usersController.addUser);

// returns all users
router.get('/', usersController.getAllUsers);

module.exports = { router };
