"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskStatusUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
class UpdateTaskStatusUseCase {
    async execute(tenantId, userId, taskId, dto) {
        const task = await prisma_1.default.task.findFirst({
            where: { id: taskId, tenantId, deletedAt: null },
            include: { meeting: true }
        });
        if (!task) {
            throw new AppError_1.NotFoundError('Tarefa não encontrada neste Workspace.');
        }
        const updatedTask = await prisma_1.default.task.update({
            where: { id: taskId },
            data: {
                status: dto.status,
                assigneeId: dto.assigneeId,
                assigneeEmail: dto.assigneeEmail,
                assigneePhone: dto.assigneePhone
            }
        });
        // Auditoria implícita
        await prisma_1.default.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'TASK_STATUS_UPDATED',
                entity: 'Task',
                entityId: taskId,
                details: JSON.stringify({ status: dto.status })
            }
        });
        return updatedTask;
    }
}
exports.UpdateTaskStatusUseCase = UpdateTaskStatusUseCase;
//# sourceMappingURL=UpdateTaskStatusUseCase.js.map