'use strict';

const { User } = require('models/users');

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Returns array of currencies for current user
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getCurrencies = (req, res) => {
    return User.findById(req.user.id)
        .exec()
        .then(user => res.status(200).json(user.currencies))
        .catch(err => res.status(500).json({message: 'Something went wrong'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Creates new currency and updates User document in db
// for current user
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.addCurrency = (req, res) => {
    const requiredFields = ['type', 'amount'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    if(typeof(req.body.type) !== 'string') {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: 'type'
        });
    } 

    if(typeof(req.body.amount) !== 'number') {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected number',
            location: 'amount'
        });
    }

    const { type, amount, buyPrice } = req.body;
    const newCurrency = { type, amount };
    if(buyPrice) {
        newCurrency.buyPrice = buyPrice;
    }
    return User
        .findByIdAndUpdate(
            req.user.id, 
            {$push: {currencies: newCurrency}}, 
            {new: true})
        .exec()
        .then(updatedUser => {
            console.log(updatedUser);
            res.status(201).json(updatedUser.apiRepr());
        })
        .catch(err => res.status(500).json({message: 'Something went wrong'}));
};