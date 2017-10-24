'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const eventsController = require('controllers/eventsController');

const router = express.Router();
router.use(bodyParser.json());


router.route('/')
	.get(eventsController.getEvents)  // READ -- get events
	.post(eventsController.addEvent); // CREATE -- add an event

router.route('/:eventId')
	.put(eventsController.updateEvent)	   // UPDATE -- update event
	.delete(eventsController.deleteEvent); // DELETE -- remove event


module.exports = { router };

