"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMeetingUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
const GoogleCalendarService_1 = require("../../../infrastructure/services/GoogleCalendarService");
class DeleteMeetingUseCase {
    async execute(tenantId, userId, managerId, meetingId) {
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id: meetingId, tenantId },
        });
        if (!meeting || meeting.deletedAt !== null) {
            throw new AppError_1.NotFoundError('Reunião não encontrada.');
        }
        if (meeting.organizerId !== userId && managerId !== meeting.organizerId) {
            throw new AppError_1.ForbiddenError('Você não possui permissões para exclusão.');
        }
        // Clean Architecture pattern: Soft Delete
        await prisma_1.default.meeting.update({
            where: { id: meetingId },
            data: { deletedAt: new Date() }
        });
        await prisma_1.default.auditLog.create({
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
                const organizer = await prisma_1.default.user.findUnique({ where: { id: userId } });
                const tokenOwnerId = organizer?.role === 'SUBORDINATE' && organizer.managerId ? organizer.managerId : userId;
                const tokenOwner = await prisma_1.default.user.findUnique({ where: { id: tokenOwnerId } });
                if (tokenOwner?.googleClientId && tokenOwner?.googleClientSecret && tokenOwner?.googleRefreshToken) {
                    const calendarService = new GoogleCalendarService_1.GoogleCalendarService();
                    await calendarService.deleteEvent({
                        clientId: tokenOwner.googleClientId,
                        clientSecret: tokenOwner.googleClientSecret,
                        refreshToken: tokenOwner.googleRefreshToken
                    }, meeting.googleEventId);
                }
            }
            catch (error) {
                console.error('Failed to delete Google Calendar event', error);
                // Fail silently as we don't want to break the local delete
            }
        }
        return true;
    }
}
exports.DeleteMeetingUseCase = DeleteMeetingUseCase;
//# sourceMappingURL=DeleteMeetingUseCase.js.map