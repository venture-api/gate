module.exports = {

    'auth:service': {
        isIn: {
            options: [['google', 'mock']],
            errorMessage: 'authentication service unknown'
        }
    },

    'factory:name': {
        isLength: {
            options: [{min: 3, max: 50}],
            errorMessage: 'bad factory name'
        }
    },

    'factory:code': {
        isLength: {
            options: [{min: 3, max: 6}],
            errorMessage: 'bad factory code'
        },
        custom: {
            options: async (code, {req}) => {
                const tasu = req.app.get('tasu');
                const logger = req.app.get('logger');
                logger.debug('validating factory code', code);
                const factory = await tasu.request('factory.identify', {code});
                return !factory;
            },
            errorMessage: 'code is not unique'
        }
    },

    'factory:type': {
        isIn: {
            options: [['iron ore', 'coal']],
            errorMessage: 'bad factory type'
        }
    },

};
