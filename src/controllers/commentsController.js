'use strict';

const { Comment } = require('models/comments');

exports.getComments = (req, res) => {
    res.send('comments');
};

exports.addComment = (req, res) => {
    // make sure required fields are in req
    const requiredFields = ['currency', 'author', 'content'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
};