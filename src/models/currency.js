const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const CurrencySchema = mongoose.Schema({
    type: {
        type: String, 
        required: true
    },
    amount: {
        type: Number, 
        required: true
    },
    buyPrice: {
        type: Number, 
        default: null
    }
});

module.exports = { CurrencySchema };