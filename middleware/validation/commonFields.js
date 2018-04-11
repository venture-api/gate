module.exports = {

    authService: {
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
        }
    },

    'factory:type': {
        isIn: {
            options: [['ore', 'coal']],
            errorMessage: 'bad factory type'
        }
    },

};
