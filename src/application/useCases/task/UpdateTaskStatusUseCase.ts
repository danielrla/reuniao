import prisma from '../../../config/prisma';
import { NotFoundError } from '../../../domain/errors/AppError';
import { UpdateTaskStatusDTO } from '../../dtos/TaskDTOs';

export class UpdateTaskStatusUseCase {
    async execute(tenantId: string, userId: string, taskId: string, dto: UpdateTaskStatusDTO) {
        const task = await prisma.task.findFirst({
            where: { id: taskId, tenantId, deletedAt: null },
            include: { meeting: true }
        });

        if (!task) {
            throw new NotFoundError('Tarefa não encontrada neste Workspace.');
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                status: dto.status,
                assigneeId: dto.assigneeId,
                assigneeEmail: dto.assigneeEmail,
                assigneePhone: dto.assigneePhone
            }
        });

        // Auditoria implícita
        await prisma.auditLog.create({
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
