'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const commentsController = require('controllers/commentsController');

const authenticate = require('services/authenticate').authenticate();

const router = express.Router();
router.use(bodyParser.json());


router.route('/currency/:currency')
	.get(commentsController.getComments)
	.post(authenticate, commentsController.addComment);
	

router.route('/:commentId')
	.get(commentsController.getComment)
	.post(authenticate, commentsController.addReplyComment)
	.delete(authenticate, commentsController.deleteComment);

router.route('/:commentId/likes')
	.get(commentsController.getUsersLiked)
	.post(authenticate, commentsController.likeComment);

router.route('/:commentId/:replyCommentId')
	.delete(authenticate, commentsController.deleteReplyComment);

router.route('/:commentId/:replyCommentId/likes')
	.get(commentsController.getReplyUsersLiked)	
	.post(authenticate, commentsController.likeReplyComment);


module.exports = { router };