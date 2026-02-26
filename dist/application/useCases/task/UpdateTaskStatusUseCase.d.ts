import { UpdateTaskStatusDTO } from '../../dtos/TaskDTOs';
export declare class UpdateTaskStatusUseCase {
    execute(tenantId: string, userId: string, taskId: string, dto: UpdateTaskStatusDTO): Promise<{
        id: string;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        meetingId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        assigneeId: string | null;
        assigneeEmail: string | null;
        assigneePhone: string | null;
        dueDate: Date | null;
    }>;
}
//# sourceMappingURL=UpdateTaskStatusUseCase.d.ts.map