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


module.exports = { router };

//event id : 59e804a719bbfa84816873e9

// db.users.find({
//       "events": {
//             $elemMatch:{_id: ObjectId("59e804a719bbfa84816873e9")}
//       }
// });