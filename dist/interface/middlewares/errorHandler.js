"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../../domain/errors/AppError");
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.name}: ${err.message}`);
    if (err instanceof AppError_1.AppError) {
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map