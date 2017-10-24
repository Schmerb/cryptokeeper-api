'use strict';

const bcrypt   = require('bcryptjs'),
      mongoose = require('mongoose');

const { EventSchema: Events }      = require("./events");
const { CurrencySchema: Currency } = require("./currency");

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String, 
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    phoneNumber: {type: Number, default: '', unique: true},
    avatar: {type: String, default: ''},
    currencies: [ Currency ],
    events: [ Events ]
});

UserSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        email: this.email || '',
        username: this.username || '',
        firstName: this.firstName || '',   
        lastName: this.lastName || '',
        phoneNumber: this.phoneNumber || '',
        avatar: this.avatar || '',
        events: this.events || '',
        currencies: this.currencies || ''
    };
};

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };
