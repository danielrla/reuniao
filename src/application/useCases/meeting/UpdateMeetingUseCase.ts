import prisma from '../../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError';
import { GoogleCalendarService } from '../../../infrastructure/services/GoogleCalendarService';

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

        // Google Calendar Sync
        if (updatedMeeting.googleEventId) {
            try {
                const organizer = await prisma.user.findUnique({ where: { id: userId } }); // Assuming editor is organizer or has access

                // If it's a subordinate editing, we ideally need the manager's tokens, but for now we fallback to the organizer's tokens
                const tokenOwnerId = organizer?.role === 'SUBORDINATE' && organizer.managerId ? organizer.managerId : userId;
                const tokenOwner = await prisma.user.findUnique({ where: { id: tokenOwnerId } });

                if (tokenOwner?.googleClientId && tokenOwner?.googleClientSecret && tokenOwner?.googleRefreshToken) {
                    const calendarService = new GoogleCalendarService();

                    const startTime = updatedMeeting.startTime || updatedMeeting.date;
                    const endTime = updatedMeeting.endTime || new Date(new Date(startTime).getTime() + 60 * 60 * 1000);

                    await calendarService.updateEvent(
                        {
                            clientId: tokenOwner.googleClientId,
                            clientSecret: tokenOwner.googleClientSecret,
                            refreshToken: tokenOwner.googleRefreshToken
                        },
                        updatedMeeting.googleEventId,
                        {
                            title: updatedMeeting.title,
                            description: updatedMeeting.description || '',
                            location: updatedMeeting.location || updatedMeeting.meetingLink || '',
                            startTime: new Date(startTime),
                            endTime: new Date(endTime)
                            // We aren't doing heavy attendee sync on updates for now to keep it simple, but could be added.
                        }
                    );
                }
            } catch (error) {
                console.error('Failed to update Google Calendar event', error);
                // Fail silently as we don't want to break the local update
            }
        }

        return updatedMeeting;
    }
}
