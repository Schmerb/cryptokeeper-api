'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const replyCommentSchema = mongoose.Schema({
    currency: {
        type: String,
        required: true
    },
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    content: {
        type: String,
        required: true
    },
    usersLiked: [{type: Schema.Types.ObjectId, ref: 'User'}],
    created: {type: Date, default: Date.now()}
});

replyCommentSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        author: this.author || '',
        content: this.content || '',
        likes: this.usersLiked.length || '',
        usersLiked: this.usersLiked || [],
        created: this.created || ''
    };
};

module.exports = { replyCommentSchema };