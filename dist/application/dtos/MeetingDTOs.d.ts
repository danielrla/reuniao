import { z } from 'zod';
export declare const CreateMeetingDTOSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    type: z.ZodEnum<{
        ONLINE: "ONLINE";
        IN_PERSON: "IN_PERSON";
    }>;
    location: z.ZodOptional<z.ZodString>;
    meetingLink: z.ZodOptional<z.ZodString>;
    agenda: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateMeetingDTO = z.infer<typeof CreateMeetingDTOSchema>;
export declare const UpdateMeetingDTOSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startTime: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    endTime: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    date: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        ONLINE: "ONLINE";
        IN_PERSON: "IN_PERSON";
    }>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meetingLink: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    agenda: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateMeetingDTO = z.infer<typeof UpdateMeetingDTOSchema>;
//# sourceMappingURL=MeetingDTOs.d.ts.map