'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const currencyController = require('controllers/currencyController');

const router = express.Router();
router.use(bodyParser.json());


router.route('/')
	.get(currencyController.getCurrencies) // READ -- get currencies
	.post(currencyController.addCurrency); // CREATE -- add currency

router.route('/:currencyId')
	.put(currencyController.updateCurrency)     // UPDATE -- update currency info
	.delete(currencyController.deleteCurrency); // DELETE -- remove currency

module.exports = { router };