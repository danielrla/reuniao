import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export const validateRequest = (schema: ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            await schema.parseAsync(req.body);
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    code: 'VALIDATION_FAILED',
                    message: 'Parâmetros inválidos enviados.',
                    details: ((error as any).issues || (error as any).errors || []).map((e: any) => ({
                        field: e.path ? e.path.join('.') : 'unknown',
                        issue: e.message,
                    })),
                    timestamp: new Date().toISOString()
                });
            }
            return next(error);
        }
    };
