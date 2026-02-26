export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;

    constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export class DomainError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'DOMAIN_VALIDATION_ERROR', details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden access') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
    }
}
