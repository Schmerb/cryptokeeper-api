'use strict';

const request = require('request');

exports.getPrice = (req, res) => {
    const BASE_URL = 'https://min-api.cryptocompare.com/data';
    const COMMON = `${BASE_URL}/price/?fsym=ETH&tsyms=BTC,USD,EUR`;
    request('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,USD,EUR', (err, _res, body) => {
        res.send(body);
    });
};