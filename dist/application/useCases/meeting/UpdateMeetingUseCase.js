"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMeetingUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
const GoogleCalendarService_1 = require("../../../infrastructure/services/GoogleCalendarService");
class UpdateMeetingUseCase {
    async execute(tenantId, userId, managerId, meetingId, updateData) {
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id: meetingId, tenantId },
        });
        if (!meeting) {
            throw new AppError_1.NotFoundError('Reunião não encontrada neste Workspace.');
        }
        if (meeting.organizerId !== userId && managerId !== meeting.organizerId) {
            throw new AppError_1.ForbiddenError('Você não tem permissão para editar esta reunião.');
        }
        const { contactIds, ...restUpdateData } = updateData;
        const updatedMeeting = await prisma_1.default.meeting.update({
            where: { id: meetingId },
            data: {
                ...restUpdateData,
                contacts: contactIds ? { set: contactIds.map((id) => ({ id })) } : undefined
            },
        });
        await prisma_1.default.auditLog.create({
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
                const organizer = await prisma_1.default.user.findUnique({ where: { id: userId } }); // Assuming editor is organizer or has access
                // If it's a subordinate editing, we ideally need the manager's tokens, but for now we fallback to the organizer's tokens
                const tokenOwnerId = organizer?.role === 'SUBORDINATE' && organizer.managerId ? organizer.managerId : userId;
                const tokenOwner = await prisma_1.default.user.findUnique({ where: { id: tokenOwnerId } });
                if (tokenOwner?.googleClientId && tokenOwner?.googleClientSecret && tokenOwner?.googleRefreshToken) {
                    const calendarService = new GoogleCalendarService_1.GoogleCalendarService();
                    const startTime = updatedMeeting.startTime || updatedMeeting.date;
                    const endTime = updatedMeeting.endTime || new Date(new Date(startTime).getTime() + 60 * 60 * 1000);
                    await calendarService.updateEvent({
                        clientId: tokenOwner.googleClientId,
                        clientSecret: tokenOwner.googleClientSecret,
                        refreshToken: tokenOwner.googleRefreshToken
                    }, updatedMeeting.googleEventId, {
                        title: updatedMeeting.title,
                        description: updatedMeeting.description || '',
                        location: updatedMeeting.location || updatedMeeting.meetingLink || '',
                        startTime: new Date(startTime),
                        endTime: new Date(endTime)
                        // We aren't doing heavy attendee sync on updates for now to keep it simple, but could be added.
                    });
                }
            }
            catch (error) {
                console.error('Failed to update Google Calendar event', error);
                // Fail silently as we don't want to break the local update
            }
        }
        return updatedMeeting;
    }
}
exports.UpdateMeetingUseCase = UpdateMeetingUseCase;
//# sourceMappingURL=UpdateMeetingUseCase.js.map