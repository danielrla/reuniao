import { z } from 'zod';

export const BaseMeetingSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    date: z.string().datetime(),
    type: z.enum(['ONLINE', 'IN_PERSON']),
    location: z.string().optional(),
    meetingLink: z.string().url("Link inválido").optional(),
    agenda: z.string().optional(),
    contactIds: z.array(z.string()).optional()
});

export const CreateMeetingDTOSchema = BaseMeetingSchema
    .refine((data) => {
        if (data.type === 'IN_PERSON' && !data.location) return false;
        return true;
    }, { message: "Localização é obrigatória para reuniões presenciais.", path: ["location"] })
    .refine((data) => {
        if (data.type === 'ONLINE' && !data.meetingLink) return false;
        return true;
    }, { message: "Link da reunião é obrigatório para reuniões online.", path: ["meetingLink"] })
    .refine((data) => {
        if (data.startTime && data.endTime) {
            return new Date(data.endTime) > new Date(data.startTime);
        }
        return true;
    }, { message: "O horário de término deve ser posterior ao horário de início.", path: ["endTime"] });

export const UpdateMeetingDTOSchema = BaseMeetingSchema.partial()
    .refine((data) => {
        if (data.type && data.type === 'IN_PERSON' && !data.location) return false;
        return true;
    }, { message: "Localização é obrigatória para reuniões presenciais.", path: ["location"] })
    .refine((data) => {
        if (data.type && data.type === 'ONLINE' && !data.meetingLink) return false;
        return true;
    }, { message: "Link da reunião é obrigatório para reuniões online.", path: ["meetingLink"] })
    .refine((data) => {
        if (data.startTime && data.endTime) {
            return new Date(data.endTime) > new Date(data.startTime);
        }
        return true;
    }, { message: "O horário de término deve ser posterior ao horário de início.", path: ["endTime"] });

export type CreateMeetingDTO = z.infer<typeof CreateMeetingDTOSchema>;
export type UpdateMeetingDTO = z.infer<typeof UpdateMeetingDTOSchema>;
