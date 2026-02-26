"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubordinateDTOSchema = exports.UpdateProfileDTOSchema = void 0;
const zod_1 = require("zod");
exports.UpdateProfileDTOSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    personalEmail: zod_1.z.string().email().optional(),
    professionalEmail: zod_1.z.string().email().optional(),
    // Validando E.164 padronizado internacional
    phone: zod_1.z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone inválido. Utilize o formato internacional (ex: +5511999999999)").optional().or(zod_1.z.literal('')),
    company: zod_1.z.string().optional(),
    mfaEnabled: zod_1.z.boolean().optional()
});
exports.CreateSubordinateDTOSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido"),
    name: zod_1.z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    phone: zod_1.z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone inválido. Utilize o formato internacional (ex: +5511999999999)").optional().or(zod_1.z.literal('')),
    company: zod_1.z.string().optional()
});
//# sourceMappingURL=UserDTOs.js.map