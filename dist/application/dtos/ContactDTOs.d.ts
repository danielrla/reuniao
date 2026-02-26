import { z } from 'zod';
export declare const CreateContactDTOSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    company: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
export declare const UpdateContactDTOSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    company: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    jobTitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    avatarUrl: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, z.core.$strip>;
export type CreateContactDTO = z.infer<typeof CreateContactDTOSchema>;
export type UpdateContactDTO = z.infer<typeof UpdateContactDTOSchema>;
//# sourceMappingURL=ContactDTOs.d.ts.map