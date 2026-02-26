"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.createAuditLog = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// Helper for Auditing
const createAuditLog = async (tenantId, userId, action, entity, entityId, details) => {
    await prisma_1.default.auditLog.create({
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
exports.createAuditLog = createAuditLog;
const getAuditLogs = async (req, res) => {
    try {
        // Only Admin or Manager should see logs probably
        const logs = await prisma_1.default.auditLog.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.status(200).json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAuditLogs = getAuditLogs;
//# sourceMappingURL=audit.controller.js.map