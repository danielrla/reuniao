"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAttachmentUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class AddAttachmentUseCase {
    async execute(tenantId, userId, managerId, meetingId, data) {
        // Validate if the meeting belongs to the tenant and is not deleted
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id: meetingId, tenantId: tenantId }
        });
        if (!meeting || meeting.deletedAt !== null) {
            throw new Error("Meeting not found or deleted");
        }
        // Add the attachment
        const attachment = await prisma_1.default.attachment.create({
            data: {
                meetingId,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                fileType: data.fileType
            }
        });
        // Audit Log
        await prisma_1.default.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'ATTACHMENT_ADDED',
                entity: 'Meeting',
                entityId: meetingId,
                details: JSON.stringify({ attachmentId: attachment.id, fileName: attachment.fileName }),
                ipAddress: '127.0.0.1' // Ideally from req.ip
            }
        });
        return attachment;
    }
}
exports.AddAttachmentUseCase = AddAttachmentUseCase;
//# sourceMappingURL=AddAttachmentUseCase.js.map