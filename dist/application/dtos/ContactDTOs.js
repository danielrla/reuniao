"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactDTOSchema = exports.CreateContactDTOSchema = void 0;
const zod_1 = require("zod");
exports.CreateContactDTOSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: zod_1.z.string().email("E-mail é obrigatório e deve ser válido"),
    phone: zod_1.z.string().min(8, "Telefone é obrigatório (mínimo 8 dígitos)").regex(/^\+?[1-9]\d{6,14}$/, "Telefone inválido. Utilize o formato E.164 (ex: +5511999999999) ou número local válido"),
    company: zod_1.z.string().optional().or(zod_1.z.literal('')),
    jobTitle: zod_1.z.string().optional().or(zod_1.z.literal('')),
    avatarUrl: zod_1.z.string().url().optional().or(zod_1.z.literal(''))
});
exports.UpdateContactDTOSchema = exports.CreateContactDTOSchema.partial();
//# sourceMappingURL=ContactDTOs.js.map