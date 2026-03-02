import prisma from '../../../config/prisma';

export class DeleteAttachmentUseCase {
    async execute(tenantId: string, userId: string, managerId: string | null, meetingId: string, attachmentId: string) {
        // Validate if the meeting belongs to the tenant and is not deleted
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId, tenantId: tenantId }
        });

        if (!meeting || meeting.deletedAt !== null) {
            throw new Error("Meeting not found or deleted");
        }

        // Validate attachment
        const attachment = await prisma.attachment.findUnique({
            where: { id: attachmentId, meetingId: meetingId }
        });

        if (!attachment || attachment.deletedAt !== null) {
            throw new Error("Attachment not found");
        }

        // Soft delete the attachment (or physical delete if preferred, but soft is safer)
        await prisma.attachment.delete({
            where: { id: attachmentId }
        });

        // Audit Log
        await prisma.auditLog.create({
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
