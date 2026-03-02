import { CreateTaskDTO } from '../../dtos/TaskDTOs';
export declare class CreateTaskUseCase {
    execute(tenantId: string, userId: string, dto: CreateTaskDTO): Promise<{
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
//# sourceMappingURL=CreateTaskUseCase.d.ts.map