import { z } from 'zod';

export const UpdateTaskStatusDTOSchema = z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    assigneeId: z.string().optional().nullable(),
    assigneeEmail: z.string().email("E-mail do responsável é inválido").optional().nullable(),
    assigneePhone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone deve estar no formato E.164 (+5511999999999)").optional().nullable(),
    notes: z.string().optional().nullable(),
    completionDate: z.string().datetime().optional().nullable()
});

export const CreateTaskDTOSchema = z.object({
    meetingId: z.string().uuid("Formato de ID de Reunião inválido"),
    description: z.string().min(3, "Descrição é obrigatória"),
    dueDate: z.string().datetime().optional().nullable(),
    assigneeId: z.string().optional().nullable(),
    assigneeEmail: z.string().email("E-mail do responsável é inválido").optional().nullable(),
    assigneePhone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone deve estar no formato E.164 (+5511999999999)").optional().nullable()
});

export const ExtractTasksDTOSchema = z.object({
    meetingId: z.string().uuid("Formato de ID de Reunião inválido")
});

export type UpdateTaskStatusDTO = z.infer<typeof UpdateTaskStatusDTOSchema>;
export type CreateTaskDTO = z.infer<typeof CreateTaskDTOSchema>;
export type ExtractTasksDTO = z.infer<typeof ExtractTasksDTOSchema>;
