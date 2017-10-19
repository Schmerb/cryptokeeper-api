'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const eventsController = require('controllers/eventsController');

const router = express.Router();
router.use(bodyParser.json());


router.get('/', eventsController.getEvents);

router.post('/', eventsController.addEvent);


module.exports = { router };