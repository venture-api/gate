module.exports = class RequestError extends Error {

    constructor (statusCode, message, details) {

        super(message || 'unknown request error');
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.details = details;
        this.statusCode = statusCode;
    }
};
