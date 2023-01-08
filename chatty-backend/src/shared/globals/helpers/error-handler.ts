import HTTP_STATUS from 'http-status-codes';

export interface IErrorResponse {
    message: string;
    statusCode: number;
    status: string;
    serializeErrors(): IError;
}

export interface IError {
    message: string;
    statusCode: number;
    status: string;
}

//Error is nodejs error object, extends make Error's methods available in our custom error class
export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract status: string;

    constructor(message: string) {
        super(message); //call the parent Error class constructor to be available in our custom error class
    }

    serializeErrors(): IError {
        return {
            message: this.message,
            statusCode: this.statusCode,
            status: this.status
        }
    }

}

export class BadRequestError extends CustomError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class NotFoundError extends CustomError {
    statusCode = HTTP_STATUS.NOT_FOUND;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class NotAuthorizedError extends CustomError {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class FileTooLargeError extends CustomError {
    statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class ServerError extends CustomError {
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class JoiRequestValidationError extends CustomError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}