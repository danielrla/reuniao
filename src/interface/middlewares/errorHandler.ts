import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    console.error(`[Error] ${err.name}: ${err.message}`);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
            details: err.details,
            timestamp: new Date().toISOString()
        });
    }

    // Fallback for unhandled/internal errors (don't leak stack traces)
    return res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
        errorDetails: err.message,
        timestamp: new Date().toISOString()
    });
};
