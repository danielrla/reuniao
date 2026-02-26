"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMeetingDTOSchema = exports.CreateMeetingDTOSchema = void 0;
const zod_1 = require("zod");
exports.CreateMeetingDTOSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    date: zod_1.z.string().datetime(),
    type: zod_1.z.enum(['ONLINE', 'IN_PERSON']),
    location: zod_1.z.string().optional(),
    meetingLink: zod_1.z.string().url("Link inválido").optional(),
    agenda: zod_1.z.string().optional()
}).refine((data) => {
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
}, { message: "O horário de término deve ser posterior ao horário de início.", path: ["endTime"] });
exports.UpdateMeetingDTOSchema = exports.CreateMeetingDTOSchema.partial();
//# sourceMappingURL=MeetingDTOs.js.map