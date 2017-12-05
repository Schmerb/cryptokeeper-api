'use strict';

const ObjectId = require('mongoose').Types.ObjectId;

const { Comment } = require('models/comments');

const populateQuery = 'author usersLiked usersDisliked replyComments.author replyComments.usersLiked replyComments.usersDisliked';

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Returns all comments for specified crypto currency,
// populates author fields if query full=true
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getComments = (req, res) => {
    const full = req.query.full;
    let author          = '',
        replyAuthor     = '',
        usersLiked      = '',
        displayFullInfo = false;
    if(full !== undefined & full == 'true') {
        author      = 'author';
        replyAuthor = 'replyComments.author';
        usersLiked  = 'usersLiked';
        displayFullInfo = true;
    }
    return Comment
        .find({currency: req.params.currency})
        // .populate('author')
        // .populate('usersLiked')
        // .populate('usersDisliked')
        // .populate('replyComments.author')
        // .populate('replyComments.usersLiked')
        // .populate('replyComments.usersDisliked')
        .populate(populateQuery)
        .sort({'createdAt': 1})
        .then(comments => {
            // Loop through all sub docs and get correct API Representation
            comments = comments.map(comment => {
                // Gets api representation of all nested / sub-docs
                comment = getApiRepr(comment);
                return comment;
            });
            res.status(200).json({comments});
        })
        .catch(err => res.status(500).json({message: 'Internal server error', err}));
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
        .populate('usersLiked usersDisliked')
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
        content,
        parentComment: commentId
    };
    return Comment
        .findByIdAndUpdate(
            commentId, 
            {$push: {replyComments: replyComment}},
            {new: true})
        .populate(populateQuery)
        .exec()
        .then(comment => {
            // Gets api representation of all nested / sub-docs
            comment = getApiRepr(comment);
            res.status(201).json(comment);
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Toggles user likes on comment
//
// 1) find comment
// 2) check if user is in likes array
// 3) if yes, remove user ID
// 4) if no, check if in dislikes array
//          yes --> a) remove user form dislikes array
//                  b) add user to likes array
//          no --> add user to likes array
// 5) return updated comment thread
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.toggleLikeComment = (req, res) => {
    const commentId = req.params.commentId;

    return Comment
        .findById(commentId)
        .populate('usersLiked')
        .populate('usersDisliked')
        .exec()
        .then(comment => {
            let userAlreadyLikes = false;
            for(let user of comment.usersLiked) {
                if(user.username === req.user.username) {
                    userAlreadyLikes = true;
                    break;
                }
            }
            let userAlreadyDislikes = false;
            for(let user of comment.usersDisliked) {
                if(user.username === req.user.username) {
                    userAlreadyDislikes = true;
                    break;
                }
            }
            if(userAlreadyLikes) {
                // remove user from array
                return Comment
                    .findByIdAndUpdate(commentId, {
                        $pull: {
                            usersLiked: req.user.id
                        }
                    }, {new: true})
                    .populate(populateQuery) // POPULATES sub-docs
                    .exec()
            } else if(userAlreadyDislikes) {
                // a) remove user from dislikes array
                return Comment
                    .findByIdAndUpdate(commentId, {
                        $pull: {
                            usersDisliked: req.user.id
                        }
                    }, {new: true})
                    .populate(populateQuery) // POPULATES sub-docs
                    .exec()
                    .then(res => {
                        // b) AND THEN add user to array
                        return Comment
                            .findByIdAndUpdate(commentId, {
                                $addToSet: {
                                    usersLiked: req.user.id
                                }
                            }, {new: true})
                            .populate(populateQuery) // POPULATES sub-docs
                            .exec()
                    })
            } else {
                // add user to array
                return Comment
                    .findByIdAndUpdate(commentId, {
                        $addToSet: {
                            usersLiked: req.user.id
                        }
                    }, {new: true})
                    .populate(populateQuery) // POPULATES sub-docs
                    .exec()
            }
        })
        .then(comment => {
            // Gets api representation of all nested / sub-docs
            comment = getApiRepr(comment);
            res.status(201).json(comment);
        })
        .catch(err => res.status(500).json({message: 'Internal server error', err}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds current user to array of dislikes
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.toggleDislikeComment = (req, res) => {
    const commentId = req.params.commentId;

    return Comment
        .findById(commentId)
        .populate('usersLiked')
        .populate('usersDisliked')
        .exec()
        .then(comment => {
            let userAlreadyDislikes = false;
            for(let user of comment.usersDisliked) {
                if(user.username === req.user.username) {
                    userAlreadyDislikes = true;
                    break;
                }
            }
            let userAlreadyLikes = false;
            for(let user of comment.usersLiked) {
                if(user.username === req.user.username) {
                    userAlreadyLikes = true;
                    break;
                }
            }
            if(userAlreadyDislikes) {
                // remove user from dislikes array
                return Comment
                    .findByIdAndUpdate(commentId, {
                        $pull: {
                            usersDisliked: req.user.id
                        }
                    }, {new: true})
                    .populate(populateQuery) // POPULATES sub-docs
                    .exec()
            } else if(userAlreadyLikes) {
                // a) remove user from likes array
                return Comment
                    .findByIdAndUpdate(commentId, {
                        $pull: {
                            usersLiked: req.user.id
                        }
                    }, {new: true})
                    .populate(populateQuery) // POPULATES sub-docs
                    .exec()
                    .then(res => {
                        // b) AND THEN add user to dislikes array
                        return Comment
                            .findByIdAndUpdate(commentId, {
                                $addToSet: {
                                    usersDisliked: req.user.id
                                }
                            }, {new: true})
                            .populate(populateQuery) // POPULATES sub-docs
                            .exec()
                    })
            } else {
                // add user to dislikes array
                return Comment
                    .findByIdAndUpdate(commentId, {
                        $addToSet: {
                            usersDisliked: req.user.id
                        }
                    }, {new: true})
                    .populate(populateQuery) // POPULATES sub-docs
                    .exec()
            }
    })
    .then(comment => {
        // Gets api representation of all nested / sub-docs
        comment = getApiRepr(comment);
        res.status(201).json(comment);
    })
    .catch(err => res.status(500).json({message: 'Internal server error', err}));
}


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Gets users who like a comment
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getUsersLiked = (req, res) => {
    return Comment
        .findById(req.params.commentId)
        .populate('usersLiked')
        .populate('usersDisliked')
        .exec()
        .then(comment => res.status(200).json({usersLiked: comment.apiRepr().usersLiked}))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds user to reply comments usersLiked array
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.toggleLikeReplyComment = (req, res) => {
    const commentId      = req.params.commentId,
          replyCommentId = req.params.replyCommentId;

    return Comment
        .findOne({"_id": commentId, "replyComments._id": replyCommentId})
        .populate('replyComments.usersLiked')
        .populate('replyComments.usersDisliked')
        .exec()
        .then(comment => {
            let userAlreadyLikes    = false;
            let userAlreadyDislikes = false;
            for(let replyComment of comment.replyComments) {
                if(replyComment.id === replyCommentId) {
                    for(let user of replyComment.usersLiked) {
                        if(user.username === req.user.username) {
                            userAlreadyLikes = true;
                            break;
                        }
                    }
                    for(let user of replyComment.usersDisliked) {
                        console.log('checking ', user);
                        if(user.username === req.user.username) {
                            userAlreadyDislikes = true;
                            break;
                        }
                    }
                }
            }
            if(userAlreadyLikes) {
                // remove user id from array
                return Comment
                    .findOneAndUpdate(
                        {"_id": commentId, "replyComments._id": replyCommentId},
                        {$pull: {
                            'replyComments.$.usersLiked': req.user.id
                        }},
                        {new: true})
                    .populate(populateQuery)
                    .exec()
            } else if(userAlreadyDislikes) {
                    // a) remove user from dislikes array
                    return Comment
                        .findOneAndUpdate(
                            {"_id": commentId, "replyComments._id": replyCommentId},
                            {$pull: {
                                'replyComments.$.usersDisliked': req.user.id
                            }},
                            {new: true})
                        .populate(populateQuery)
                        .exec()
                        .then(res => {
                            // b) add user id to likes array
                            return Comment
                                .findOneAndUpdate(
                                    {"_id": commentId, "replyComments._id": replyCommentId},
                                    {$addToSet: {
                                        'replyComments.$.usersLiked': req.user.id
                                    }},
                                    {new: true})
                                .populate(populateQuery)
                                .exec()
                        })
            } else {
                // add user id to array
                return Comment
                    .findOneAndUpdate(
                        {"_id": commentId, "replyComments._id": replyCommentId},
                        {$addToSet: {
                            'replyComments.$.usersLiked': req.user.id
                        }},
                        {new: true})
                    .populate(populateQuery)
                    .exec()
            }
        })
        .then(comment => {
            // Gets api representation of all nested / sub-docs
            comment = getApiRepr(comment);
            res.status(201).json(comment)
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));

    
        
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds user to reply comments usersDisliked array
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.toggleDislikeReplyComment = (req, res) => {
    const commentId      = req.params.commentId,
          replyCommentId = req.params.replyCommentId;

    return Comment
        .findOne({"_id": commentId, "replyComments._id": replyCommentId})
        .populate('replyComments.usersLiked')
        .populate('replyComments.usersDisliked')
        .exec()
        .then(comment => {
            let userAlreadyLikes    = false;
            let userAlreadyDislikes = false;
            for(let replyComment of comment.replyComments) {
                if(replyComment.id === replyCommentId) {
                    for(let user of replyComment.usersDisliked) {
                        if(user.username === req.user.username) {
                            userAlreadyDislikes = true;
                            break;
                        }
                    }
                    for(let user of replyComment.usersLiked) {
                        if(user.username === req.user.username) {
                            userAlreadyLikes = true;
                            break;
                        }
                    }
                }
            }
            if(userAlreadyDislikes) {
                // remove user from dislikes array
                return Comment
                    .findOneAndUpdate(
                        {"_id": commentId, "replyComments._id": replyCommentId},
                        {$pull: {
                            'replyComments.$.usersDisliked': req.user.id
                        }},
                        {new: true})
                    .populate(populateQuery)
                    .exec()
            } else if(userAlreadyLikes) {
                // a) remove user from likes array to start
                return Comment
                    .findOneAndUpdate(
                        {"_id": commentId, "replyComments._id": replyCommentId},
                        {$pull: {
                            'replyComments.$.usersLiked': req.user.id
                        }},
                        {new: true})
                    .populate(populateQuery)
                    .exec()
                    .then(res => {
                        // b) add user id to dislikes array
                        return Comment
                            .findOneAndUpdate(
                                {"_id": commentId, "replyComments._id": replyCommentId},
                                {$addToSet: {
                                    'replyComments.$.usersDisliked': req.user.id
                                }},
                                {new: true})
                            .populate(populateQuery)
                            .exec()
                    })
            } else {
                // add user to dislikes array
                return Comment
                    .findOneAndUpdate(
                        {"_id": commentId, "replyComments._id": replyCommentId},
                        {$addToSet: {
                            'replyComments.$.usersDisliked': req.user.id
                        }},
                        {new: true})
                    .populate(populateQuery)
                    .exec()
            }
        })
        .then(comment => {
            // Gets api representation of all nested / sub-docs
            comment = getApiRepr(comment);
            res.status(201).json(comment)
        })
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
        .populate('replyComments.usersDisliked')
        .exec()
        .then(comment => {
            const usersLiked = comment.replyComments.id(replyCommentId).usersLiked;
            res.status(201).json({usersLiked});
        })
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
            return Comment
                .findByIdAndUpdate(
                    commentId, {
                        $pull : {
                            'replyComments': {"_id": replyCommentId}
                        }
                    }, {new: true})
                    .exec()
        })
        .then(user => res.status(201).json(user.apiRepr()))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Gets the API representation for all nested / sub-docs
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function getApiRepr(comment) {
    comment = comment.apiRepr();
    if(comment.author) { // conditional for mock testing dummy data
        comment.author = comment.author.apiRepr();
    }
    comment.usersLiked = comment.usersLiked.map(userLiked => {
        userLiked = userLiked.apiRepr();
        return userLiked;
    });
    // comment.usersDisliked = comment.usersDisliked.map(userDisliked => {return userDisliked.apiRepr()});
    comment.usersDisliked = comment.usersDisliked.map(userDisliked => {
        userDisliked = userDisliked.apiRepr();
        return userDisliked;
    });
    comment.replyComments = comment.replyComments.map(replyComment => {
        replyComment = replyComment.apiRepr();
        replyComment.author = replyComment.author.apiRepr();
        replyComment.usersLiked = replyComment.usersLiked.map(userLiked => {
            userLiked = userLiked.apiRepr();
            return userLiked;
        });
        replyComment.usersDisliked = replyComment.usersDisliked.map(userDisliked => {
            userDisliked = userDisliked.apiRepr();
            return userDisliked;
        });
        return replyComment;
    });
    return comment;
}