const bcrypt   = require('bcryptjs'),
      mongoose = require('mongoose');

const { EventSchema } = require("./events");
const { CurrencySchema } = require("./currency");
// import { EventSchema } from "../events/models";

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
    phoneNumber: {type: Number, default: ''},
    currencies: [ {} ],
    events: [ EventSchema ]
});

UserSchema.methods.apiRepr = function() {
    return {
        email: this.email || '',
        username: this.username || '',
        firstName: this.firstName || '',   
        lastName: this.lastName || ''
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
