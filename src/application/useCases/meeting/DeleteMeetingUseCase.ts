import prisma from '../../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError';

export class DeleteMeetingUseCase {
    async execute(tenantId: string, userId: string, managerId: string | null, meetingId: string) {
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId, tenantId },
        });

        if (!meeting || meeting.deletedAt !== null) {
            throw new NotFoundError('Reunião não encontrada.');
        }

        if (meeting.organizerId !== userId && managerId !== meeting.organizerId) {
            throw new ForbiddenError('Você não possui permissões para exclusão.');
        }

        // Clean Architecture pattern: Soft Delete
        await prisma.meeting.update({
            where: { id: meetingId },
            data: { deletedAt: new Date() }
        });

        await prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'MEETING_DELETED',
                entity: 'Meeting',
                entityId: meetingId
            }
        });

        return true;
    }
}
