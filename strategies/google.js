const {Strategy} = require('passport-google-oauth20');
const fedCallback = require('../util/fedCallback');


module.exports = (googleConfig) => {

    const {clientID, clientSecret} = googleConfig;

    return new Strategy({

        clientID,
        clientSecret,
        scope: ['email', 'profile', 'https://www.googleapis.com/auth/drive'],
        accessType: 'offline',
        approvalPrompt: 'force'

    }, fedCallback);
};
