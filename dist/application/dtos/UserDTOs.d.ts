import { z } from 'zod';
export declare const UpdateProfileDTOSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    personalEmail: z.ZodOptional<z.ZodString>;
    professionalEmail: z.ZodOptional<z.ZodString>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    company: z.ZodOptional<z.ZodString>;
    mfaEnabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CreateSubordinateDTOSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    company: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateProfileDTO = z.infer<typeof UpdateProfileDTOSchema>;
export type CreateSubordinateDTO = z.infer<typeof CreateSubordinateDTOSchema>;
//# sourceMappingURL=UserDTOs.d.ts.map