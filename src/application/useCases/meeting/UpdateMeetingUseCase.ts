import prisma from '../../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError';

export class UpdateMeetingUseCase {
    async execute(tenantId: string, userId: string, managerId: string | null, meetingId: string, updateData: any) {
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId, tenantId },
        });

        if (!meeting) {
            throw new NotFoundError('Reunião não encontrada neste Workspace.');
        }

        if (meeting.organizerId !== userId && managerId !== meeting.organizerId) {
            throw new ForbiddenError('Você não tem permissão para editar esta reunião.');
        }

        const { contactIds, ...restUpdateData } = updateData;

        const updatedMeeting = await prisma.meeting.update({
            where: { id: meetingId },
            data: {
                ...restUpdateData,
                contacts: contactIds ? { set: contactIds.map((id: string) => ({ id })) } : undefined
            },
        });

        await prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'MEETING_UPDATED',
                entity: 'Meeting',
                entityId: updatedMeeting.id,
                details: JSON.stringify(Object.keys(updateData))
            }
        });

        return updatedMeeting;
    }
}
