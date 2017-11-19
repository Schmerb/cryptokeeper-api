exports.DATABASE_URL = 
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/react-db';
exports.TEST_DATABASE_URL = 
    process.env.TEST_DATABASE_URL ||
    global.TEST_DATABASE_URL ||
    'mongodb://localhost/react-test-db';

exports.CLIENT_ORIGIN = 'https://www.cryptokeeper.co';
exports.PORT = process.env.PORT || 8080;

// Client --> Netlify
exports.CLIENT_ORIGIN = 'https://cryptokeeper.netlify.com';
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'; 

// Twilio
exports.TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
exports.TWILIO_ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
exports.TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;

// Mailgun
exports.MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;