export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare class DomainError extends AppError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(message: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=AppError.d.ts.map