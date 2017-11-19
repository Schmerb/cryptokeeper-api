'use strict';

const request = require('request');
const async   = require('async');

exports.getPrices = (cb) => {
    
    const url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XMR,LTC,DASH,DOGE,XRP&tsyms=USD,EUR,GBP,AUD";

    request({url, json: true}, (err, res, body) => {
        // console.log('\n\nRES: ', body, "\n\n");
        cb(body);
    });

    // function httpGet(url, callback) {
    //     const options = {
    //         url :  url,
    //         json : true
    //     };
    //     request(options,
    //         function(err, res, body) {
    //             callback(err, body);
    //         }
    //     );
    // }

    // const urls = [
    //     "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,USD,EUR,GBP,AUD",
    //     "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=ETH,USD,EUR,GBP,AUD",
    //     "https://min-api.cryptocompare.com/data/price?fsym=XMR&tsyms=XMR,USD,EUR,GBP,AUD",
    //     "https://min-api.cryptocompare.com/data/price?fsym=LTC&tsyms=LTC,USD,EUR,GBP,AUD",
    //     "https://min-api.cryptocompare.com/data/price?fsym=DASH&tsyms=DASH,USD,EUR,GBP,AUD",
    //     "https://min-api.cryptocompare.com/data/price?fsym=DOGE&tsyms=DOGE,USD,EUR,GBP,AUD",
    //     "https://min-api.cryptocompare.com/data/price?fsym=XRP&tsyms=XRP,USD,EUR,GBP,AUD"
    // ];
    
    // async.map(urls, httpGet, function (err, res){
    //     if (err) return console.log(err);
    //     console.log("prices: ", res);
    //     cb(res); // returns all data to callback
    // });
}