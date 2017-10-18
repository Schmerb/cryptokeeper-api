'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const twilioController = require('controllers/twilioController');

const router = express.Router();
router.use(bodyParser.json());


router.get('/', twilioController.sendTextMessage)


module.exports = { router };