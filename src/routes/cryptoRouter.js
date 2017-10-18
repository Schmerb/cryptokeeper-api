'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const cryptoController = require('controllers/cryptoController');

const router = express.Router();
router.use(bodyParser.json());

router.get('/', cryptoController.getPrice);

module.exports = { router };


