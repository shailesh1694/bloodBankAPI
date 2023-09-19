
class CustomeError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.status = statusCode;
        this.msg = message;
        this.success = false;
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }
}
module.exports = CustomeError;