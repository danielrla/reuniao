import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=auth.middleware.d.ts.map