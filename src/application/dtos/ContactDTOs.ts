import { z } from 'zod';

export const CreateContactDTOSchema = z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail é obrigatório e deve ser válido"),
    phone: z.string().min(8, "Telefone é obrigatório (mínimo 8 dígitos)").regex(/^\+?[1-9]\d{6,14}$/, "Telefone inválido. Utilize o formato E.164 (ex: +5511999999999) ou número local válido"),
    company: z.string().optional().or(z.literal('')),
    jobTitle: z.string().optional().or(z.literal('')),
    avatarUrl: z.string().url().optional().or(z.literal(''))
});

export const UpdateContactDTOSchema = CreateContactDTOSchema.partial();

export type CreateContactDTO = z.infer<typeof CreateContactDTOSchema>;
export type UpdateContactDTO = z.infer<typeof UpdateContactDTOSchema>;
