"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMeetingUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const qrcode_1 = __importDefault(require("qrcode"));
const GoogleCalendarService_1 = require("../../../infrastructure/services/GoogleCalendarService");
class CreateMeetingUseCase {
    async execute(tenantId, organizerId, dto) {
        const meeting = await prisma_1.default.meeting.create({
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
        const qrCodeUrl = await qrcode_1.default.toDataURL(qrData);
        const updatedMeeting = await prisma_1.default.meeting.update({
            where: { id: meeting.id },
            data: { qrCodeUrl },
        });
        // Logging auditoria diretamente
        await prisma_1.default.auditLog.create({
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
            const organizer = await prisma_1.default.user.findUnique({ where: { id: organizerId } });
            if (organizer?.googleClientId && organizer?.googleClientSecret && organizer?.googleRefreshToken) {
                const calendarService = new GoogleCalendarService_1.GoogleCalendarService();
                // Construct the attendees array (inviting contacts and subordinates if any)
                // Fetch contacts emails
                const invitedEmails = [];
                if (dto.contactIds && dto.contactIds.length > 0) {
                    const contacts = await prisma_1.default.contact.findMany({
                        where: { id: { in: dto.contactIds } },
                        select: { email: true }
                    });
                    contacts.forEach(c => c.email && invitedEmails.push(c.email));
                }
                const startTime = dto.startTime ? new Date(dto.startTime) : new Date(dto.date);
                const endTime = dto.endTime ? new Date(dto.endTime) : new Date(new Date(startTime).getTime() + 60 * 60 * 1000); // Defaults to 1 hour
                const googleEventId = await calendarService.createEvent({
                    clientId: organizer.googleClientId,
                    clientSecret: organizer.googleClientSecret,
                    refreshToken: organizer.googleRefreshToken
                }, {
                    title: dto.title,
                    description: dto.description || '',
                    location: dto.location || dto.meetingLink || '',
                    startTime,
                    endTime,
                    attendees: invitedEmails.length > 0 ? invitedEmails : undefined
                });
                await prisma_1.default.meeting.update({
                    where: { id: meeting.id },
                    data: { googleEventId }
                });
            }
        }
        catch (error) {
            console.error('Failed to sync meeting to Google Calendar on creation', error);
            // Optionally, we could save a sync error flag here, but we fail silently intentionally
            // so the meeting isn't rolled back just because calendar failed.
        }
        return updatedMeeting;
    }
}
exports.CreateMeetingUseCase = CreateMeetingUseCase;
//# sourceMappingURL=CreateMeetingUseCase.js.map