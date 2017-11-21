'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const twilioController = require('controllers/twilioController');

const router = express.Router();
router.use(bodyParser.json());

router.get('/', twilioController.sendTextMessage)

router.post('/verify-phone/start/:phoneNumber', twilioController.requestVerificationCode);
router.post('/verify-phone/check/:phoneNumber/:code', twilioController.verifyCode);


module.exports = { router };