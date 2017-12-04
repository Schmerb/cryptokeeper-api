'use strict';

const request = require('request');
const async   = require('async');



function httpGet(url, callback) {
    const options = {
        url :  url,
        json : true
    };
    request(options,  
        function(err, res, body) {
            callback(err, body);
        }
    );
}

const urls = [
    "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,USD,EUR",
    "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=ETH,USD,EUR",
    "https://min-api.cryptocompare.com/data/price?fsym=XMR&tsyms=XMR,USD,EUR",
    "https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=LTC,USD,EUR",
    "https://min-api.cryptocompare.com/data/price?fsym=DASH&tsyms=DASH,USD,EUR",
    "https://min-api.cryptocompare.com/data/price?fsym=DOGE&tsyms=DOGE,USD,EUR",
    "https://min-api.cryptocompare.com/data/price?fsym=XRP&tsyms=XRP,USD,EUR"
];

exports.getPrice = (req, res) => {
    async.map(urls, httpGet, function (err, _res){
        if (err) return console.log(err);
        console.log(_res);
        res.send(_res);
    });
}; 
