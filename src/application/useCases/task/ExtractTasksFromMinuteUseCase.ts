import prisma from '../../../config/prisma';
import { NotFoundError } from '../../../domain/errors/AppError';
import { ExtractTasksDTO } from '../../dtos/TaskDTOs';
import { summarizeMeeting } from '../../../services/ai.service'; // Mocked Service Layer

export class ExtractTasksFromMinuteUseCase {
    async execute(tenantId: string, userId: string, dto: ExtractTasksDTO) {
        const minute = await prisma.minute.findFirst({
            where: { meetingId: dto.meetingId, meeting: { tenantId } }
        });

        if (!minute || !minute.transcript) {
            throw new NotFoundError('Transcrição não encontrada para esta reunião.');
        }

        // Call Infrastructure Service for AI computation
        const aiResult = await summarizeMeeting(minute.transcript);

        // Save summary back to minute
        await prisma.minute.update({
            where: { id: minute.id },
            data: { content: JSON.stringify(aiResult.summary) }
        });

        // Create Tasks sequentially or in bulk with strict Tenant adherence
        const createdTasks = await Promise.all(
            aiResult.tasks.map((t: any) => prisma.task.create({
                data: {
                    tenantId,
                    meetingId: dto.meetingId,
                    description: t.description,
                    dueDate: t.dueDate ? new Date(t.dueDate) : null,
                    assigneeEmail: t.assigneeEmail,
                    assigneePhone: t.assigneePhone,
                }
            }))
        );

        await prisma.auditLog.create({
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
