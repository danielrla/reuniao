import { Request, Response } from 'express';
export declare const createAuditLog: (tenantId: string, userId: string, action: string, entity: string, entityId: string, details?: any) => Promise<void>;
export declare const getAuditLogs: (req: Request, res: Response) => Promise<any>;
//# sourceMappingURL=audit.controller.d.ts.map