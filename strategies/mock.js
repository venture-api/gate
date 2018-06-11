const {Strategy} = require('passport-oauth2');
const fedCallback = require('../util/fedCallback');
const {players: {bonner}} = require('@venture-api/fixtures');


class MockOAuthStrategy extends Strategy {

    constructor(options, verify) {

        super(options, verify);
        this.name = 'mock';
        this.passAuthentication = options.passAuthentication || true;
        this.userId = options.userId || 1;
        this.verify = verify;
    };

    userProfile(accessToken, done) {
        return done(null, {
            emails: [{value: bonner.email}],
            displayName: bonner.name
        })
    };

}


module.exports = ({host, port}) => {

    const entrypoint = `http://${host}:${port}`;

    return new MockOAuthStrategy({

        authorizationURL: `${entrypoint}/mockOAuth/auth`,
        tokenURL: `${entrypoint}/mockOAuth/token`,
        clientID: 'MOCKCLIENTID',
        clientSecret: 'MOCKCLIENTSECRET',
        scope: ['user:email','repo', 'write:repo_hook'],
        profileFields: ['id', 'displayName', 'email']

    }, fedCallback);
};
