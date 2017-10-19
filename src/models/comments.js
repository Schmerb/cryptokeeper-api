'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: {type: Number, default: 0},
    usersLiked: [{type: String, default: ''}],
    created: {type: Date, default: Date.now()}
});

commentSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        author: this.author || '',
        content: this.content || '',
        likes: this.likes || '',
        usersLiked: this.usersLiked || '',
        created: this.created || ''
    };
};


const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };