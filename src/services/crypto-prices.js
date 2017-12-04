'use strict';

const request = require('request');

exports.getPrices = (cb) => {
    
    const url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XMR,LTC,DASH,DOGE,XRP&tsyms=USD,EUR,GBP,AUD";

    request({url, json: true}, (err, res, body) => {
        cb(body);
    });
}