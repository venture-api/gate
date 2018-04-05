const {Strategy} = require('passport-oauth2');
const fedCallback = require('../util/fedCallback');


class MockOAuthStrategy extends Strategy {

    constructor(options, verify) {

        super(options, verify);
        this.name = 'mock';
        this.passAuthentication = options.passAuthentication || true;
        this.userId = 'MOCK-USR-001';
        this.verify = verify;
    };

    // authenticate(req) {
    //
    //     if (this.passAuthentication) {
    //         const user = {id: this.userId};
    //         const self = this;
    //         this.verify(user, function(error, resident) {
    //             if (error) {
    //                 self.fail(error);
    //             } else {
    //                 self.success(resident);
    //             }
    //         });
    //     } else {
    //         this.fail('Unauthorized');
    //     }
    //
    // };

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
