const errors = require('../error/codes')


class ApiError extends Error{

    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
        //this.name = name;
    }

    static badRequest(message, name) {

        let userMessage = message;

        if (name) {

            const err = errors.find(i => i.code === name);

            userMessage = err ? err.name : message
        }


        console.log(message)
        console.log(name)

        return new ApiError(401, userMessage);
    }

    static internal(message) {
        return new ApiError(500, message);
    }

    static forbidden(message) {
        return new ApiError(403, message);
    }
}

module.exports = ApiError