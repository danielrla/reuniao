"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractTasksFromMinuteUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
const ai_service_1 = require("../../../services/ai.service"); // Mocked Service Layer
class ExtractTasksFromMinuteUseCase {
    async execute(tenantId, userId, dto) {
        const minute = await prisma_1.default.minute.findFirst({
            where: { meetingId: dto.meetingId, meeting: { tenantId } }
        });
        if (!minute || !minute.transcript) {
            throw new AppError_1.NotFoundError('Transcrição não encontrada para esta reunião.');
        }
        // Call Infrastructure Service for AI computation
        const aiResult = await (0, ai_service_1.summarizeMeeting)(minute.transcript);
        // Save summary back to minute
        await prisma_1.default.minute.update({
            where: { id: minute.id },
            data: { content: JSON.stringify(aiResult.summary) }
        });
        // Create Tasks sequentially or in bulk with strict Tenant adherence
        const createdTasks = await Promise.all(aiResult.tasks.map((t) => prisma_1.default.task.create({
            data: {
                tenantId,
                meetingId: dto.meetingId,
                description: t.description,
                dueDate: t.dueDate ? new Date(t.dueDate) : null,
                assigneeEmail: t.assigneeEmail,
                assigneePhone: t.assigneePhone,
            }
        })));
        await prisma_1.default.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'TASKS_EXTRACTED_AI',
                entity: 'Minute',
                entityId: minute.id
            }
        });
        return { summary: aiResult.summary, decisions: aiResult.decisions, tasks: createdTasks };
    }
}
exports.ExtractTasksFromMinuteUseCase = ExtractTasksFromMinuteUseCase;
//# sourceMappingURL=ExtractTasksFromMinuteUseCase.js.map