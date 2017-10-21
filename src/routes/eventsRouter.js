'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const eventsController = require('controllers/eventsController');

const router = express.Router();
router.use(bodyParser.json());

// GET events
router.get('/', eventsController.getEvents);

// CREATE event
router.post('/', eventsController.addEvent);

// UPDATE event
router.put('/:eventId', eventsController.updateEvent);

// DELETE event
router.delete('/:eventId', eventsController.deleteEvent);


module.exports = { router };

