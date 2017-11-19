'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const commentsController = require('controllers/commentsController');

const authenticate = require('services/authenticate').authenticate();

const router = express.Router();
router.use(bodyParser.json());

// Currency asociated with comments
router.route('/currency/:currency')
	.get(commentsController.getComments)
	.post(authenticate, commentsController.addComment);

// Specific comment
router.route('/:commentId')
	.get(commentsController.getComment)
	.post(authenticate, commentsController.addReplyComment)
	.delete(authenticate, commentsController.deleteComment);

router.route('/:commentId/likes')
	.get(commentsController.getUsersLiked)
	.post(authenticate, commentsController.toggleLikeComment); // toggles likes on comment

router.route('/:commentId/dislikes')
	.post(authenticate, commentsController.toggleDislikeComment); // toggles dislike on comment

// Specific reply comment
router.route('/:commentId/comments/:replyCommentId')
	.delete(authenticate, commentsController.deleteReplyComment);

router.route('/:commentId/comments/:replyCommentId/likes')
	.get(commentsController.getReplyUsersLiked)	
	.post(authenticate, commentsController.toggleLikeReplyComment); // toggles likes on reply comment

router.route('/:commentId/comments/:replyCommentId/dislikes')
	.post(authenticate, commentsController.toggleDislikeReplyComment); // toggles dislikes on reply comment

module.exports = { router };