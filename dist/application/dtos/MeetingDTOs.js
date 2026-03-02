"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMeetingDTOSchema = exports.CreateMeetingDTOSchema = exports.BaseMeetingSchema = void 0;
const zod_1 = require("zod");
exports.BaseMeetingSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    date: zod_1.z.string().datetime(),
    type: zod_1.z.enum(['ONLINE', 'IN_PERSON']),
    location: zod_1.z.string().optional(),
    meetingLink: zod_1.z.string().url("Link inválido").optional(),
    agenda: zod_1.z.string().optional(),
    contactIds: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['MARCADA', 'CANCELADA', 'REAGENDADA', 'REALIZADA']).optional(),
    cancellationReason: zod_1.z.string().optional()
});
exports.CreateMeetingDTOSchema = exports.BaseMeetingSchema
    .refine((data) => {
    if (data.type === 'IN_PERSON' && !data.location)
        return false;
    return true;
}, { message: "Localização é obrigatória para reuniões presenciais.", path: ["location"] })
    .refine((data) => {
    if (data.type === 'ONLINE' && !data.meetingLink)
        return false;
    return true;
}, { message: "Link da reunião é obrigatório para reuniões online.", path: ["meetingLink"] })
    .refine((data) => {
    if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
}, { message: "O horário de término deve ser posterior ao horário de início.", path: ["endTime"] })
    .refine((data) => {
    if (data.status === 'CANCELADA' && (!data.cancellationReason || data.cancellationReason.trim().length === 0)) {
        return false;
    }
    return true;
}, { message: "O motivo do cancelamento é obrigatório quando a reunião for cancelada.", path: ["cancellationReason"] });
exports.UpdateMeetingDTOSchema = exports.BaseMeetingSchema.partial()
    .refine((data) => {
    if (data.type && data.type === 'IN_PERSON' && !data.location)
        return false;
    return true;
}, { message: "Localização é obrigatória para reuniões presenciais.", path: ["location"] })
    .refine((data) => {
    if (data.type && data.type === 'ONLINE' && !data.meetingLink)
        return false;
    return true;
}, { message: "Link da reunião é obrigatório para reuniões online.", path: ["meetingLink"] })
    .refine((data) => {
    if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
}, { message: "O horário de término deve ser posterior ao horário de início.", path: ["endTime"] })
    .refine((data) => {
    if (data.status === 'CANCELADA' && (!data.cancellationReason || data.cancellationReason.trim().length === 0)) {
        return false;
    }
    return true;
}, { message: "O motivo do cancelamento é obrigatório quando a reunião for cancelada.", path: ["cancellationReason"] });
//# sourceMappingURL=MeetingDTOs.js.map