'use strict';

const router     = require('express').Router(),
      fs         = require('fs'),
      mongoose   = require('mongoose'),
      Grid       = require('gridfs-stream'),
      busboyBodyParser = require('busboy-body-parser');

const fileController = require('controllers/fileController');

    
let conn   = mongoose.connection;
Grid.mongo = mongoose.mongo;

router.use(busboyBodyParser({ limit: '10mb' })); // required for gridFS file store 

conn.once('open', () => {
    const gfs = Grid(conn.db);

    fileController.init(gfs); // pass in gridfs connection object

    router.get('/', fileController.getIndex);
    router.post('/', fileController.storeAvatarImg);
    router.get('/:imgId', fileController.getAvatarImg);
    router.delete('/:imgId', fileController.deleteAvatarImg);
});


module.exports = { router };

