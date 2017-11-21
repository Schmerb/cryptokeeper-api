'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const twilioController = require('controllers/twilioController');

const router = express.Router();
router.use(bodyParser.json());

router.get('/', twilioController.sendTextMessage)

router.post('/verify-phone/:phoneNumber', twilioController.requestVerificationCode);



module.exports = { router };