"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAttachmentUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class DeleteAttachmentUseCase {
    async execute(tenantId, userId, managerId, meetingId, attachmentId) {
        // Validate if the meeting belongs to the tenant and is not deleted
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id: meetingId, tenantId: tenantId }
        });
        if (!meeting || meeting.deletedAt !== null) {
            throw new Error("Meeting not found or deleted");
        }
        // Validate attachment
        const attachment = await prisma_1.default.attachment.findUnique({
            where: { id: attachmentId, meetingId: meetingId }
        });
        if (!attachment || attachment.deletedAt !== null) {
            throw new Error("Attachment not found");
        }
        // Soft delete the attachment (or physical delete if preferred, but soft is safer)
        await prisma_1.default.attachment.delete({
            where: { id: attachmentId }
        });
        // Audit Log
        await prisma_1.default.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'ATTACHMENT_DELETED',
                entity: 'Meeting',
                entityId: meetingId,
                details: JSON.stringify({ attachmentId }),
                ipAddress: '127.0.0.1' // Ideally from req.ip
            }
        });
        return { success: true };
    }
}
exports.DeleteAttachmentUseCase = DeleteAttachmentUseCase;
//# sourceMappingURL=DeleteAttachmentUseCase.js.map