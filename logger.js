const winston = require('winston');
const moment = require('moment');


const formatter = (options) =>  {
    return `${options.timestamp()} gateway ${options.level.toUpperCase()} ${options.message || ''} ${options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''}`;

};

const logger = new(winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: process.env.LOG_LEVEL || 'info',
            timestamp: () => {return moment().toISOString()},
            formatter,
            stderrLevels: ['error']
        })
    ]
});

module.exports =  logger;
