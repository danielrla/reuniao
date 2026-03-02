"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        return next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                code: 'VALIDATION_FAILED',
                message: 'Parâmetros inválidos enviados.',
                details: (error.issues || error.errors || []).map((e) => ({
                    field: e.path ? e.path.join('.') : 'unknown',
                    issue: e.message,
                })),
                timestamp: new Date().toISOString()
            });
        }
        return next(error);
    }
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map