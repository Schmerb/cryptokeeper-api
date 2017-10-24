'use strict';

let auth;
exports.init = passport => {
    auth = passport.authenticate('jwt', {session: false});
    // console.log('insider service', auth);
};

exports.authenticate = () => auth;