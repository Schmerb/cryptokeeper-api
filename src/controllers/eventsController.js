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
//
// @returns     New added event object
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.addEvent = (req, res) => {

    // make sure required fields are in req
    const requiredFields = ['name', 'currency', 'basePrice' ,'type', 'condition', 'value', 'valueType', 'message'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
    const { name, currency, basePrice, type, condition, value, valueType, message } = req.body;
    const newEvent = {
        currency,
        basePrice,
        type,
        condition, 
        value, 
        valueType, 
        name: name.trim(), 
        message: message.trim()
    };
    return User
        .findByIdAndUpdate(
            req.user.id, 
            {$push: {events: newEvent}}, 
            {new: true})
        .exec()
        .then(updatedUser => {
            let events = updatedUser.events;
            let newResEvent = events[events.length - 1];
            res.status(201).json(newResEvent);
        })
        .catch(err => res.status(500).json({code: 500, message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Updates existing event for given user
//
// @returns     All events including updated one
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.updateEvent = (req, res) => {
    const updated = {};
    const updateableFields = ['name', 'currency', 'type', 'condition', 'value', 'valueType', 'message', 'successful'];
    updateableFields.forEach(field => {
        if(field in req.body) {
            updated[`events.$.${field}`] = req.body[field];
        }
    });
    if(updated !== {}) {
        updated["events.$.successful"] = false;
    }
    const userId  = req.user.id;
    const eventId = req.params.eventId;
    return User
        .findOneAndUpdate(
            {"_id": userId, "events._id": eventId},
            {$set: updated},
            {new: true}
        )
        .then(updatedUser => {
            res.status(201).json(updatedUser.apiRepr().events)
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Deletes event from user collection array
//
// @returns     All events except event removed
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.deleteEvent = (req, res) => {
    return User.
        findByIdAndUpdate(req.user.id, {
            $pull: {
                'events': {"_id": req.params.eventId}
            }
        }, {new: true})
        .then(user => {
            res.status(201).json(user.apiRepr().events)
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}
