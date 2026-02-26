import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Helper for Auditing
export const createAuditLog = async (tenantId: string, userId: string, action: string, entity: string, entityId: string, details?: any) => {
    await prisma.auditLog.create({
        data: {
            tenantId,
            userId,
            action,
            entity,
            entityId,
            details: details ? JSON.stringify(details) : undefined
        }
    });
};

export const getAuditLogs = async (req: Request, res: Response): Promise<any> => {
    try {
        // Only Admin or Manager should see logs probably
        const logs = await prisma.auditLog.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
