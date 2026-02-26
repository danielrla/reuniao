import { ExtractTasksDTO } from '../../dtos/TaskDTOs';
export declare class ExtractTasksFromMinuteUseCase {
    execute(tenantId: string, userId: string, dto: ExtractTasksDTO): Promise<{
        summary: any;
        decisions: any;
        tasks: any[];
    }>;
}
//# sourceMappingURL=ExtractTasksFromMinuteUseCase.d.ts.map