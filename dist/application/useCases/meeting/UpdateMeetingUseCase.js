"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMeetingUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
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
        const updatedMeeting = await prisma_1.default.meeting.update({
            where: { id: meetingId },
            data: updateData,
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
        return updatedMeeting;
    }
}
exports.UpdateMeetingUseCase = UpdateMeetingUseCase;
//# sourceMappingURL=UpdateMeetingUseCase.js.map