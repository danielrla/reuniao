import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
export declare const validateRequest: (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=validateRequest.d.ts.map