'use strict';

const express    = require('express'),
      bodyParser = require('body-parser');

const commentsController = require('controllers/commentsController');
      

const router = express.Router();
router.use(bodyParser.json());


router.get('/:currency', commentsController.getComments);

router.post('/:currency', commentsController.addComment);

module.exports = { router };