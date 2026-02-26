"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMeetingUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
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
        return true;
    }
}
exports.DeleteMeetingUseCase = DeleteMeetingUseCase;
//# sourceMappingURL=DeleteMeetingUseCase.js.map