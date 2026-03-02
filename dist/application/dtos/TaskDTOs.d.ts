import { z } from 'zod';
export declare const UpdateTaskStatusDTOSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneeEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneePhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    completionDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const CreateTaskDTOSchema: z.ZodObject<{
    meetingId: z.ZodString;
    description: z.ZodString;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneeEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneePhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const ExtractTasksDTOSchema: z.ZodObject<{
    meetingId: z.ZodString;
}, z.core.$strip>;
export type UpdateTaskStatusDTO = z.infer<typeof UpdateTaskStatusDTOSchema>;
export type CreateTaskDTO = z.infer<typeof CreateTaskDTOSchema>;
export type ExtractTasksDTO = z.infer<typeof ExtractTasksDTOSchema>;
//# sourceMappingURL=TaskDTOs.d.ts.map