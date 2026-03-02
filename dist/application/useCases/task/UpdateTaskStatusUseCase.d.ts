import { UpdateTaskStatusDTO } from '../../dtos/TaskDTOs';
export declare class UpdateTaskStatusUseCase {
    execute(tenantId: string, userId: string, taskId: string, dto: UpdateTaskStatusDTO): Promise<{
        id: string;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        meetingId: string;
        assigneeId: string | null;
        assigneeEmail: string | null;
        assigneePhone: string | null;
        notes: string | null;
        completionDate: Date | null;
        dueDate: Date | null;
    }>;
}
//# sourceMappingURL=UpdateTaskStatusUseCase.d.ts.map