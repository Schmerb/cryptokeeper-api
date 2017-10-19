'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const currencyController = require('controllers/currencyController');

const router = express.Router();
router.use(bodyParser.json());


router.get('/', currencyController.getCurrencies);

router.post('/', currencyController.addCurrency);


module.exports = { router };