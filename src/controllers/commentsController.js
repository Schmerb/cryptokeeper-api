'use strict';

const { Comment } = require('models/comments');

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Returns all comments for specified crypto currency,
// populates author fields if query full=true
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getComments = (req, res) => {
    const full = req.query.full;
    let author          = '',
        replyAuthor     = '',
        displayFullInfo = false;
    if(full !== undefined & full == 'true') {
        author = 'author';
        replyAuthor = 'replyComments.author';
        displayFullInfo = true;
    }
    return Comment
        .find({currency: req.params.currency})
        .populate(author)
        .populate(replyAuthor)
        .then(comments => {
            comments = comments.map(comment => {
                comment = comment.apiRepr();
                // if query full=true then return full api representation of User
                comment.author = displayFullInfo ? comment.author.apiRepr() : comment.author;
                comment.replyComments = comment.replyComments.map(replyComment => {
                    // maps over each replycomment and gets Api Representation for ReplyComments and Users
                    replyComment = replyComment.apiRepr();
                    // if query full=true then return full api representation of User
                    replyComment.author = displayFullInfo ? replyComment.author.apiRepr() : replyComment.author;
                    return replyComment;
                })
                return comment;
            });
            res.status(200).json({comments})
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Returns comment by id, populates author fields if
// query full=true
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getComment = (req, res) => {
    const full = req.query.full;
    let author          = '',
        replyAuthor     = '',
        displayFullInfo = false;
    if(full !== undefined & full == 'true') {
        author = 'author';
        replyAuthor = 'replyComments.author';
        displayFullInfo = true;
    }
    return Comment
        .findById(req.params.commentId)
        .populate(author)
        .populate(replyAuthor)
        .then(comment => {
            // get api representation for all Comments 
            comment = comment.apiRepr();
            // and for User if query full=true
            comment.author = displayFullInfo ? comment.author.apiRepr() : comment.author;
            comment.replyComments = comment.replyComments.map(replyComment => {
                // get api representation for all ReplyComments 
                replyComment = replyComment.apiRepr();
                // and for User if query full=true
                replyComment.author = displayFullInfo ? replyComment.author.apiRepr() : replyComment.author;
                return replyComment;
            });
            res.status(200).json({comment});
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds comment to db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.addComment = (req, res) => {
    // make sure required fields are in req
    const requiredFields = ['currency', 'content'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
    if(req.body.currency !== req.params.currency) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Param and request currencies do not match',
            location: ['req.body.currency', 'req.params.currency']
        });
    }
    const { currency, content } = req.body;
    const author = req.user.id;
    return Comment
        .create({
            currency,
            author,
            content
        })
        .then(comment => res.status(201).json(comment.apiRepr()))
        .catch(err => res.status(500).json({code: 500, message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Updates comment
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.likeComment = (req, res) => {
    const commentId = req.params.commentId;
    return Comment
        .findByIdAndUpdate(commentId, {
            $addToSet: {
                usersLiked: req.user.id
            }
        })
        .exec()
        .then(comment => {
            res.status(200).json(comment.apiRepr());
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Gets users who like a comment
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getUsersLiked = (req, res) => {
    return Comment
        .findById(req.params.commentId)
        .populate('usersLiked')
        .exec()
        .then(comment => res.status(200).json({usersLiked: comment.apiRepr().usersLiked}))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds user to reply comments usersLiked array
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.likeReplyComment = (req, res) => {
    const commentId      = req.params.commentId,
          replyCommentId = req.params.replyCommentId;
    return Comment
        .findOneAndUpdate(
            {"_id": commentId, "replyComments._id": replyCommentId},
            {$addToSet: {
                'replyComments.$.usersLiked': req.user.id
            }},
            {new: true})
        .exec()
        .then(replyComment => res.status(201).json(replyComment))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Gets users who liked reply comment
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getReplyUsersLiked = (req, res) => {
    const commentId      = req.params.commentId,
          replyCommentId = req.params.replyCommentId; 
    return Comment
        .findById(commentId)
        .populate('replyComments.usersLiked')
        .exec()
        .then(comment => {
            const usersLiked = comment.replyComments.id(replyCommentId).usersLiked;
            res.status(201).json({usersLiked});
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Updates comment
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.addReplyComment = (req, res) => {
    // make sure required fields are in req
    const requiredFields = ['currency', 'content'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
    const { currency, content } = req.body;
    const author    = req.user.id,
          commentId = req.params.commentId;
    const replyComment = {
        author,
        currency,
        content
    };
    return Comment
        .findByIdAndUpdate(
            commentId, 
            {$push: {replyComments: replyComment}},
            {new: true})
        .exec()
        .then(comment => res.status(201).json(comment))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Deletes comment from db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.deleteComment = (req, res) => {
    const commentId = req.params.commentId;
    return Comment  
        .findById(commentId)
        .exec()
        .then(comment => {
            if(comment.author !== req.user.id) {
                return Promise.reject({
                    code: 422,
                    reason: 'UnauthorizedError',
                    message: 'User logged in does not match author of comment',
                    location: ['req.user.username', 'comment.author']
                });
            }
            return Comment  
                .findByIdAndRemove(commentId)
        })
        .then(() => res.status(201).json({status: 'deleted'}))
        .catch(err => {
            if (err.reason === 'UnauthorizedError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Deletes reply comment from db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.deleteReplyComment = (req, res) => {
    const commentId      = req.params.commentId,
          replyCommentId = req.params.replyCommentId;
    return Comment  
        .findById(commentId)
        .exec()
        .then(comment => {
            if(comment.replyComments.id(replyCommentId).author !== req.user.id) {
                return Promise.reject({
                    code: 422,
                    reason: 'UnauthorizedError',
                    message: 'User logged in does not match author of comment',
                    location: ['req.user.username', 'comment.author']
                });
            }
            console.log('INSIDE');
            return Comment
                .findByIdAndUpdate(commentId, {
                    $pull : {
                        'replyComments': {"_id": replyCommentId}
                    }
                }, {new: true})
                .exec()
        })
        .then(user => res.status(201).json(user.apiRepr()))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}