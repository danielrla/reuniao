import prisma from '../../../config/prisma';
import { CreateTaskDTO } from '../../dtos/TaskDTOs';
import { NotFoundError } from '../../../domain/errors/AppError';

export class CreateTaskUseCase {
    async execute(tenantId: string, userId: string, dto: CreateTaskDTO) {

        // Ensure meeting exists and belongs to the tenant
        const meeting = await prisma.meeting.findFirst({
            where: { id: dto.meetingId, tenantId, deletedAt: null }
        });

        if (!meeting) {
            throw new NotFoundError('Reunião não encontrada ou não pertence a este Workspace.');
        }

        const task = await prisma.task.create({
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
        await prisma.auditLog.create({
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
