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
    parentComment: {type: Schema.Types.ObjectId, ref: 'Comment'},
    usersLiked: [{type: Schema.Types.ObjectId, ref: 'User'}],
    usersDisliked: [{type: Schema.Types.ObjectId, ref: 'User'}]
}, { timestamps: true });

replyCommentSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        author: this.author || '',
        content: this.content || '',
        parentComment: this.parentComment || '',
        likes: this.usersLiked.length || '',
        usersLiked: this.usersLiked || [],
        usersDisliked: this.usersDisliked || [],
        createdAt: this.createdAt || '',
        updatedAt: this.updatedAt || '',
    };
};

module.exports = { replyCommentSchema };