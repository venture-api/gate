module.exports = class RequestError extends Error {

    constructor (status, message) {

        super(message || 'request error');
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.status = status;
    }
};
