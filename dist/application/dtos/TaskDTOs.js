"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractTasksDTOSchema = exports.UpdateTaskStatusDTOSchema = void 0;
const zod_1 = require("zod");
exports.UpdateTaskStatusDTOSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    assigneeId: zod_1.z.string().optional().nullable(),
    assigneeEmail: zod_1.z.string().email("E-mail do responsável é inválido").optional().nullable(),
    assigneePhone: zod_1.z.string().regex(/^\+[1-9]\d{1,14}$/, "Telefone deve estar no formato E.164 (+5511999999999)").optional().nullable()
});
exports.ExtractTasksDTOSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid("Formato de ID de Reunião inválido")
});
//# sourceMappingURL=TaskDTOs.js.map