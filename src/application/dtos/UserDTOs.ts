import { z } from 'zod';

export const UpdateProfileDTOSchema = z.object({
    name: z.string().optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    personalEmail: z.string().email().optional(),
    professionalEmail: z.string().email().optional(),
    // Validando E.164 padronizado internacional
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone inválido. Utilize o formato internacional (ex: +5511999999999)").optional().or(z.literal('')),
    company: z.string().optional(),
    mfaEnabled: z.boolean().optional(),
    googleClientId: z.string().optional().or(z.literal('')),
    googleClientSecret: z.string().optional().or(z.literal('')),
    googleRefreshToken: z.string().optional().or(z.literal(''))
});

export const CreateSubordinateDTOSchema = z.object({
    email: z.string().email("Email inválido"),
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone inválido. Utilize o formato internacional (ex: +5511999999999)").optional().or(z.literal('')),
    company: z.string().optional()
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileDTOSchema>;
export type CreateSubordinateDTO = z.infer<typeof CreateSubordinateDTOSchema>;
