'use strict';

const router     = require('express').Router(),
      fs         = require('fs'),
      mongoose   = require('mongoose'),
      Grid       = require('gridfs-stream');

const authenticate = require('services/authenticate').authenticate();

const fileController = require('controllers/fileController');

// busboybody parser at server.js --> app
    
let conn   = mongoose.connection;
Grid.mongo = mongoose.mongo;

conn.once('open', () => {
    const gfs = Grid(conn.db);

    fileController.init(gfs); // pass in gridfs connection object

    router.route('/')
        .get(authenticate, fileController.getUserAvatar)
        .post(authenticate, fileController.storeAvatarImg);

    router.route('/:imgId')
        .get(fileController.getAvatarImg)    
        .delete(authenticate, fileController.deleteAvatarImg)
        .put(authenticate, fileController.changeAvatarImg);
});


module.exports = { router };

