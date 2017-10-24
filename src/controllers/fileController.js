'use strict';

const ObjectID = require('mongodb').ObjectID;

let gfs;

// // // // // // // // // // // // // // // // // // 
//
// Contructor to load GridFS Connection obj
//
// // // // // // // // // // // // // // // // // // 
exports.init = (gridConn) => {
    gfs = gridConn;
    // return exports;
};

// * * * * * * * * * * * * * * *
// Tests index is working
// * * * * * * * * * * * * * * *
exports.getIndex = (req, res) => {
    // console.log(gfs);
    res.send('file index endpoint~!');
};

// * * * * * * * * * * * * * * *
// Fetches img from db
// * * * * * * * * * * * * * * *
exports.getAvatarImg = (req, res) => {

    let objId = ObjectID(req.params.imgId);
    gfs.files.find(
        ObjectID(req.params.imgId)
    ).toArray((err, files) => {

        if (files.length === 0) {
            return res.status(400).send({
                message: 'File not found'
            });
        }
        
        let data = [];
        let readstream = gfs.createReadStream({
            filename: files[0].filename
        });

        readstream.on('data', (chunk) => {
            data.push(chunk);
        });

        readstream.on('end', () => {
            data = Buffer.concat(data);
            let imgName = files[0].filename;

            // parses file type extension from file name
            let temp = [];
            for (let i = imgName.length - 1; i >= 0; i--) {
                if (imgName[i] === '.') {
                    break;
                }
                temp.push(imgName[i]);
            }
            let fileExt = temp.reverse().join('');
            let img = `data:image/${fileExt};base64,` + Buffer(data).toString('base64');
            res.json({url: img});
        });

        readstream.on('error', (err) => {
            console.log('An error occurred!', err);
            throw err;
        });
    });
};

// * * * * * * * * * * * * * * *
// Removes img from db
// * * * * * * * * * * * * * * *
exports.deleteAvatarImg = (req, res) => {
    let objId = {
        _id: ObjectID(req.params.imgId)
    };

    gfs.remove(objId, function (err) {
        if (err) return handleError(err);
        console.log('success');
        res.status(204).json({
            status: 'success, img removed from db'
        });
    });
};

// * * * * * * * * * * * * * * *
// Stores image in db
// * * * * * * * * * * * * * * *
exports.storeAvatarImg = (req, res) => {

    // console.log(req);

    let part = req.files.file;
    let writeStream = gfs.createWriteStream({
        filename: 'img_' + part.name,
        mode: 'w',
        content_type: part.mimetype
    });

    writeStream.on('close', (file) => {
        return res.status(200).send({
            message: 'Success',
            file: file
        });
    });
    writeStream.write(part.data);
    writeStream.end();
};


