const {coal, ironOre} = require('./resourceTypes');
const {moisture, ash} = require('./defectTypes');


const dict = {};

dict[coal] = [moisture, ash];
dict[ironOre] = [moisture];

module.exports = dict;
