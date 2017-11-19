'use strict';

const mongoose = require('mongoose');

const { replyCommentSchema: ReplyComments } = require('models/replyComments');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({
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
    usersDisliked: [{type: Schema.Types.ObjectId, ref: 'User'}],
    replyComments: [ ReplyComments ]
}, { timestamps: true });

commentSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        currency: this.currency,
        content: this.content,
        author: this.author || '',
        likes: this.usersLiked.length || '',
        usersLiked: this.usersLiked || [],
        usersDisliked: this.usersDisliked || [],
        replyComments: this.replyComments || [],
        createdAt: this.createdAt || '',
        updatedAt: this.updatedAt || ''
    };
};


const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };