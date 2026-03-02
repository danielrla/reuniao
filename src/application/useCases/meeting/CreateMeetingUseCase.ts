import prisma from '../../../config/prisma';
import QRCode from 'qrcode';
import { CreateMeetingDTO } from '../../dtos/MeetingDTOs';
import { GoogleCalendarService } from '../../../infrastructure/services/GoogleCalendarService';

export class CreateMeetingUseCase {
    async execute(tenantId: string, organizerId: string, dto: CreateMeetingDTO) {
        const meeting = await prisma.meeting.create({
            data: {
                title: dto.title,
                description: dto.description || null,
                type: dto.type,
                location: dto.location || null,
                meetingLink: dto.meetingLink || null,
                date: new Date(dto.date),
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
                agenda: dto.agenda || null,
                status: dto.status || 'MARCADA',
                cancellationReason: dto.cancellationReason || null,
                organizerId,
                tenantId,
                contacts: dto.contactIds && dto.contactIds.length > 0
                    ? { connect: dto.contactIds.map(id => ({ id })) }
                    : undefined
            },
        });

        const qrData = JSON.stringify({ meetingId: meeting.id, tenantId });
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        const updatedMeeting = await prisma.meeting.update({
            where: { id: meeting.id },
            data: { qrCodeUrl },
        });

        // Logging auditoria diretamente
        await prisma.auditLog.create({
            data: {
                tenantId,
                userId: organizerId,
                action: 'MEETING_CREATED',
                entity: 'Meeting',
                entityId: meeting.id,
                details: JSON.stringify({ title: dto.title })
            }
        });

        // Google Calendar Sync
        try {
            const organizer = await prisma.user.findUnique({ where: { id: organizerId } });

            if (organizer?.googleClientId && organizer?.googleClientSecret && organizer?.googleRefreshToken) {
                const calendarService = new GoogleCalendarService();

                // Construct the attendees array (inviting contacts and subordinates if any)
                // Fetch contacts emails
                const invitedEmails: string[] = [];
                if (dto.contactIds && dto.contactIds.length > 0) {
                    const contacts = await prisma.contact.findMany({
                        where: { id: { in: dto.contactIds } },
                        select: { email: true }
                    });
                    contacts.forEach(c => c.email && invitedEmails.push(c.email));
                }

                const startTime = dto.startTime ? new Date(dto.startTime) : new Date(dto.date);
                const endTime = dto.endTime ? new Date(dto.endTime) : new Date(new Date(startTime).getTime() + 60 * 60 * 1000); // Defaults to 1 hour

                const googleEventId = await calendarService.createEvent(
                    {
                        clientId: organizer.googleClientId,
                        clientSecret: organizer.googleClientSecret,
                        refreshToken: organizer.googleRefreshToken
                    },
                    {
                        title: dto.title,
                        description: dto.description || '',
                        location: dto.location || dto.meetingLink || '',
                        startTime,
                        endTime,
                        attendees: invitedEmails.length > 0 ? invitedEmails : undefined
                    }
                );

                await prisma.meeting.update({
                    where: { id: meeting.id },
                    data: { googleEventId }
                });
            }
        } catch (error) {
            console.error('Failed to sync meeting to Google Calendar on creation', error);
            // Optionally, we could save a sync error flag here, but we fail silently intentionally
            // so the meeting isn't rolled back just because calendar failed.
        }

        return updatedMeeting;
    }
}
