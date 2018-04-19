module.exports = {

    factoryOne: {
        name: 'Road Runner Ore',
        id: 'FC-RDRN-OR-UH6hgj',
        code: 'RDRN',
        ownerId: 'PL-JRA01',
        type: 'iron ore',
        region: 'Brookmarsh'
    },

    factoryTwo: {
        name: 'Fellowship Investments',
        id: 'FC-FINV-OR-UH6hgj',
        code: 'FINV',
        ownerId: 'PL-fInv980',
        type: 'coal',
        region: 'Aldcastle'
    },

    playerOne: {
        email: 'JohnRAdams@armyspy.com',
        name: 'John R. Adams'
    },

    resourceOne_: {
        type: 'iron ore',
        location: 'FC-RDRN-OR-UH6hgj',
        ownerId: 'PL-JRA01',
        defects: ['moisture', 'ash']
    },

    regionOne: {
        name: 'Brookmarsh',
        defects: {
            moisture: 40,
            ash: 10
        },
        resources: {
            "coal": 9999999,
            "iron ore": 99999
        }
    }

};