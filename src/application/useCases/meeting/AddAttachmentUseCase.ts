import prisma from '../../../config/prisma';

export class AddAttachmentUseCase {
    async execute(tenantId: string, userId: string, managerId: string | null, meetingId: string, data: { fileName: string, fileUrl: string, fileType?: string }) {
        // Validate if the meeting belongs to the tenant and is not deleted
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId, tenantId: tenantId }
        });

        if (!meeting || meeting.deletedAt !== null) {
            throw new Error("Meeting not found or deleted");
        }

        // Add the attachment
        const attachment = await prisma.attachment.create({
            data: {
                meetingId,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                fileType: data.fileType
            }
        });

        // Audit Log
        await prisma.auditLog.create({
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
