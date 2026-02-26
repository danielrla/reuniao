import { Request, Response, NextFunction } from 'express';
export declare const requireRole: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => any;
export declare const requireMeetingManager: (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=rbac.middleware.d.ts.map