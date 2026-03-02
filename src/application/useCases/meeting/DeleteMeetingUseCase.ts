import prisma from '../../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError';
import { GoogleCalendarService } from '../../../infrastructure/services/GoogleCalendarService';

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

        // Google Calendar Sync (Delete)
        if (meeting.googleEventId) {
            try {
                const organizer = await prisma.user.findUnique({ where: { id: userId } });
                const tokenOwnerId = organizer?.role === 'SUBORDINATE' && organizer.managerId ? organizer.managerId : userId;
                const tokenOwner = await prisma.user.findUnique({ where: { id: tokenOwnerId } });

                if (tokenOwner?.googleClientId && tokenOwner?.googleClientSecret && tokenOwner?.googleRefreshToken) {
                    const calendarService = new GoogleCalendarService();
                    await calendarService.deleteEvent(
                        {
                            clientId: tokenOwner.googleClientId,
                            clientSecret: tokenOwner.googleClientSecret,
                            refreshToken: tokenOwner.googleRefreshToken
                        },
                        meeting.googleEventId
                    );
                }
            } catch (error) {
                console.error('Failed to delete Google Calendar event', error);
                // Fail silently as we don't want to break the local delete
            }
        }

        return true;
    }
}
