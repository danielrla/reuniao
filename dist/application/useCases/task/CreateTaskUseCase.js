"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
class CreateTaskUseCase {
    async execute(tenantId, userId, dto) {
        // Ensure meeting exists and belongs to the tenant
        const meeting = await prisma_1.default.meeting.findFirst({
            where: { id: dto.meetingId, tenantId, deletedAt: null }
        });
        if (!meeting) {
            throw new AppError_1.NotFoundError('Reunião não encontrada ou não pertence a este Workspace.');
        }
        const task = await prisma_1.default.task.create({
            data: {
                tenantId,
                meetingId: dto.meetingId,
                description: dto.description,
                status: 'PENDING', // Forced default
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                assigneeId: dto.assigneeId,
                assigneeEmail: dto.assigneeEmail,
                assigneePhone: dto.assigneePhone
            }
        });
        // Audit log for manual creation
        await prisma_1.default.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'TASK_CREATED_MANUALLY',
                entity: 'Task',
                entityId: task.id,
                details: JSON.stringify({ description: task.description })
            }
        });
        return task;
    }
}
exports.CreateTaskUseCase = CreateTaskUseCase;
//# sourceMappingURL=CreateTaskUseCase.js.map