'use strict';

const ObjectID = require('mongodb').ObjectID;

const { User } = require('models/users');

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
exports.getUserAvatar = (req, res) => {
    return User
        .findById(req.user.id)
        .exec()
        .then(user => {
            // let objId = ObjectID(req.params.imgId);
            if(user.avatar.length > 0) {
                gfs.files.find(
                    ObjectID(user.avatar)
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
                        res.status(200).json({url: img, avatarId: user.avatar});
                    });
            
                    readstream.on('error', (err) => {
                        console.log('An error occurred!', err);
                        throw err;
                    });
                });
            } else {
                res.status(400).json({message: 'User does not have an avatar image.'});
            }
        })
        .catch(err => res.status(500).json({message: 'Internal server error', err}));
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
            res.json({url: img, avatarId: req.params.imgId});
        });

        readstream.on('error', (err) => {
            console.log('An error occurred!', err);
            throw err;
        });
    });
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Removes img from db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.deleteAvatarImg = (req, res) => {
    let objId = {
        _id: ObjectID(req.params.imgId)
    };

    gfs.remove(objId, function (err) {
        if (err) return handleError(err);
        console.log('success');
        return User
            .findByIdAndUpdate(req.user.id, 
                {$set: {avatar: ""}},
                {new: true}
            )
            .exec()
            .then(updated => {
                console.log('UPDATED:, ', updated);
                res.sendStatus(204);
            })
            .catch(err => res.status(500).json({message: 'Internal server error', err}));
    });
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Stores/updates image in db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.storeAvatarImg = (req, res) => {
    // 1) Checks if user has a current avatar uploaded
    //     yes --> deletes avatar file/chunks
    // 2) Then adds new image to db
    const { username } = req.user;

    return User
        .findOne({ username })
        .exec()
        .then(user => {
            const { avatar } = user;
            let part = req.files.file;
            let writeStream = gfs.createWriteStream({
                filename: 'img_' + part.name,
                mode: 'w',
                content_type: part.mimetype
            });

            if(avatar.length > 0) {
                console.log('NEED TO REMOVE FIRST');
                const objId = {
                    _id: ObjectID(avatar)
                };
                // remove avatar first
                gfs.remove(objId, function (err) {
                    if (err) return handleError(err);
                    console.log('successfully deleted existing img');
                    // then add new avatar file
                    writeStream.on('close', (file) => updateUserAvatar(req, res, file));
                    writeStream.write(part.data);
                    writeStream.end();
                });
            } else {
                console.log('ADD FILE ASAP');
                // No previous avatar, add file immediately 
                writeStream.on('close', (file) => updateUserAvatar(req, res, file));
                writeStream.write(part.data);
                writeStream.end();
            }
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Finds user in db and updates their doc with
// new avatar id
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
function updateUserAvatar(req, res, file) {
    return User
        .findByIdAndUpdate(req.user.id, 
            {$set: {avatar: file._id}},
            {new: true}
        )
        .exec()
        .then(user => {
            console.log('successfully added new img');
            return res.status(200).send({
                message: 'Success',
                file: file,
                user
            });
        })
        .catch(err => res.status(500).json({message: 'Internal server error', err}));
}

// * * * * * * * * * * * * * * *
// Changes image in db
// * * * * * * * * * * * * * * *
exports.changeAvatarImg = (req, res) => {
    // TODO
    //  1) delete existing img
    //  2) add new img
    let objId = {
        _id: ObjectID(req.params.imgId)
    };

    gfs.remove(objId, function (err) {
        if (err) return handleError(err);
        console.log('successfully deleted existing img');
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
    });
};


