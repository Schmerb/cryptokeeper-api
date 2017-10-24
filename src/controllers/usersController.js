'use strict';

const { User } = require('models/users');


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds a user to the database
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.addUser = (req, res) => {
    const requiredFields = ['email', 'username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['email', 'username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    // If the username and password aren't trimmed we give an error.  Users might
    // expect that these will work without trimming (i.e. they want the password
    // "foobar ", including the space at the end).  We need to reject such values
    // explicitly so the users know what's happening, rather than silently
    // trimming them and expecting the user to understand.
    // We'll silently trim the other fields, because they aren't credentials used
    // to log in, so it's less of a problem.
    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 10,
            // bcrypt truncates after 72 characters, so let's not give the illusion
            // of security by storing extra (unused) info
            max: 72
        }
    };
    const tooSmallField = Object.keys(sizedFields).find(
        field =>
            'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
            'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${sizedFields[tooSmallField]
                      .min} characters long`
                : `Must be at most ${sizedFields[tooLargeField]
                      .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let {email, username, password, firstName = '', lastName = ''} = req.body;
    // Username and password come in pre-trimmed, otherwise we throw an error
    // before this
    email = email.trim();
    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({username})
        .count()
        .then(count => {
            console.log('inside find');
            console.log('count = ', count);
            if (count > 0) {
                // There is an existing user with the same username
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            // If there is no existing user, hash the password
            return User.hashPassword(password);
        })
        .then(hash => {
            console.log('before create user');
            return User.create({
                email,
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.apiRepr());
        })
        .catch(err => {
            // Forward validation errors on to the client, otherwise give a 500
            // error because something unexpected has happened
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
};


// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Returns all of user's data
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getUser = (req, res) => {
    return User 
        .findById(req.user.id)
        .then(user => res.json( user.apiRepr()))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see 
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.getAllUsers = (req, res) => {
    return User.find()
        .then(users => res.json(users.map(user => user.apiRepr())))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Updates user docuement
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.updateUser = (req, res) => {
    const updated = {};
    const updateableFields = ['email', 'phoneNumber'];
    updateableFields.forEach(field => {
        if(field in req.body) {
            updated[field] = req.body[field];
        }
    });

    return User
        .findByIdAndUpdate(req.user.id, {$set: updated}, {new: true})
        .exec()
        .then(updatedUser => res.status(201).json(updatedUser))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Checks for email availability and updates user's account
// if email is not already taken
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.updateEmail = (req, res) => {
    const { email } = req.body;
    return User
        .find({ email })
        .count()
        .exec()
        .then(count => {
            if(count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'An account is already registered with this email, please use a different email address.',
                    location: 'email'
                });
            }
        })
        .then(() => {
            return User
                .findByIdAndUpdate(req.user.id, {$set: { email }}, {new: true})
                .exec()
        })
        .then(updatedUser => res.status(201).json(updatedUser))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Adds / Updates user's phone number which will receive
// sms notifications
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.updatePhoneNumber = (req, res) => {
    const { phoneNumber } = req.body;
    return User
        .find({ phoneNumber })
        .count()
        .exec()
        .then(count => {
            if(count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'This phone number is already associated with an account, please use a different phone number.',
                    location: 'phoneNumber'
                });
            }
        })
        .then(() => {
            return User
                .findByIdAndUpdate(req.user.id, {$set: { phoneNumber }}, {new: true})
                .exec()
        })
        .then(updatedUser => res.status(201).json(updatedUser))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// Deletes user's account from db
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
exports.deleteAccount = (req, res) => {
    return User 
        .findByIdAndRemove(req.user.id)
        .exec()
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
}
