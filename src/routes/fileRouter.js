'use strict';

const router     = require('express').Router(),
      fs         = require('fs'),
      mongoose   = require('mongoose'),
      Grid       = require('gridfs-stream');
    //   busboyBodyParser = require('busboy-body-parser');

const fileController = require('controllers/fileController');

    
let conn   = mongoose.connection;
Grid.mongo = mongoose.mongo;

// router.use(busboyBodyParser({ limit: '10mb' })); // required for gridFS file store 

conn.once('open', () => {
    const gfs = Grid(conn.db);

    fileController.init(gfs); // pass in gridfs connection object

    router.route('/')
        .get(fileController.getUserAvatar)
        .post(fileController.storeAvatarImg);

    router.get('/:imgId', fileController.getAvatarImg);
    router.delete('/:imgId', fileController.deleteAvatarImg);
    router.put('/:imgId', fileController.changeAvatarImg);
});


module.exports = { router };

