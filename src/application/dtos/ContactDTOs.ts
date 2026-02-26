import { z } from 'zod';

export const CreateContactDTOSchema = z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido").optional(),
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone inválido. Utilize o formato E.164 (ex: +5511999999999)").optional().or(z.literal('')),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    avatarUrl: z.string().url().optional().or(z.literal(''))
});

export const UpdateContactDTOSchema = CreateContactDTOSchema.partial();

export type CreateContactDTO = z.infer<typeof CreateContactDTOSchema>;
export type UpdateContactDTO = z.infer<typeof UpdateContactDTOSchema>;
