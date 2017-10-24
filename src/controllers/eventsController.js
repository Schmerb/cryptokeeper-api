'use strict';

const { User } = require('models/users');

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Returns array of user's events from db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getEvents = (req, res) => {
    return User.findById(req.user.id)
        .exec()
        .then(user => res.status(200).json(user.events))
        .catch(err => res.status(500).json({message: 'Something went wrong'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds an event to the user's document in db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.addEvent = (req, res) => {
    // make sure required fields are in req
    const requiredFields = ['name', 'currency', 'type', 'condition', 'value', 'valueType', 'message'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
    const { name, currency, type, condition, value, valueType, message } = req.body;
    const newEvent = {
        name, 
        currency, 
        type,
        condition, 
        value, 
        valueType, 
        message
    };
    return User
        .findByIdAndUpdate(
            req.user.id, 
            {$push: {events: newEvent}}, 
            {new: true})
        .exec()
        .then(updatedUser => res.status(201).json(updatedUser.apiRepr().events))
        .catch(err => res.status(500).json({message: 'Something went wrong', err}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Updates existing event for given user
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.updateEvent = (req, res) => {
    const updated = {};
    const updateableFields = ['name', 'currency', 'type', 'condition', 'value', 'valueType', 'message'];
    updateableFields.forEach(field => {
        if(field in req.body) {
            updated[`events.$.${field}`] = req.body[field];
        }
    });
    const userId  = req.user.id;
    const eventId = req.params.eventId;
    return User
        .findOneAndUpdate(
            {"_id": userId, "events._id": eventId},
            {$set: updated},
            {new: true}
        )
        .then(user => {
            console.log(user.events.id(eventId));
            res.status(201).json(user.apiRepr())
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Deletes event from user collection array
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.deleteEvent = (req, res) => {
    return User.
        findByIdAndUpdate(req.user.id, {
            $pull: {
                'events': {"_id": req.params.eventId}
            }
        })
        .then(user => {
            res.status(201).json(user.apiRepr())
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}
