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
    // make sure strings fields are string
    const stringFields = ['name', 'currency', 'condition', 'valueType', 'message'];
    const nonStringField = stringFields.find(field =>
        (field in req.body) && typeof req.body[field] !== 'string'
    );
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }
    // make sure 'value' is a number
    if('value' in req.body && typeof(req.body.value) !== 'number') {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected number',
            location: 'value'
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
        .then(updatedUser => res.status(201).json(updatedUser.apiRepr()))
        .catch(err => res.status(500).json({message: 'Something went wrong', err}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Updates existing event for given user
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.updateEvent = (req, res) => {
    let eventId = req.params.eventId;
    console.log(eventId);
    // make sure strings fields are string
    const stringFields = ['name', 'currency', 'condition', 'valueType', 'message'];
    const nonStringField = stringFields.find(field =>
        (field in req.body) && typeof req.body[field] !== 'string'
    );
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }
    // make sure 'value' is a number
    if('value' in req.body && typeof(req.body.value) !== 'number') {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected number',
            location: 'value'
        });
    }

    const updateFields = {};
    for(let prop in req.body) {
        updateFields[`events.$.${prop}`] = req.body[prop];
    }
    return User
        .findOneAndUpdate(
            {"_id": req.user.id, "events._id":eventId},
            {$set: updateFields}
        )
        .then(user => {
            console.log(user.events.id(eventId));
            res.status(200).json(user.apiRepr())
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
            res.status(200).json(user.apiRepr())
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}



// .find({
//     "events": {
//         $elemMatch:{_id: ObjectId(eventId)}
//     }
// })

// Folder.findOneAndUpdate(
//     { "_id": folderId, "permissions._id": permission._id },
//     { 
//         "$set": {
//             "permissions.$": permission
//         }
//     },
//     function(err,doc) {

//     }
// );