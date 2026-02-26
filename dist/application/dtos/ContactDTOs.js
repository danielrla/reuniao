"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactDTOSchema = exports.CreateContactDTOSchema = void 0;
const zod_1 = require("zod");
exports.CreateContactDTOSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: zod_1.z.string().email("E-mail inválido").optional(),
    phone: zod_1.z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone inválido. Utilize o formato E.164 (ex: +5511999999999)").optional().or(zod_1.z.literal('')),
    company: zod_1.z.string().optional(),
    jobTitle: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional().or(zod_1.z.literal(''))
});
exports.UpdateContactDTOSchema = exports.CreateContactDTOSchema.partial();
//# sourceMappingURL=ContactDTOs.js.map