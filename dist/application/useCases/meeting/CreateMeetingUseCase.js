"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMeetingUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const qrcode_1 = __importDefault(require("qrcode"));
class CreateMeetingUseCase {
    async execute(tenantId, organizerId, dto) {
        const meeting = await prisma_1.default.meeting.create({
            data: {
                title: dto.title,
                description: dto.description || null,
                type: dto.type,
                location: dto.location || null,
                meetingLink: dto.meetingLink || null,
                date: new Date(dto.date),
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
                agenda: dto.agenda || null,
                organizerId,
                tenantId
            },
        });
        const qrData = JSON.stringify({ meetingId: meeting.id, tenantId });
        const qrCodeUrl = await qrcode_1.default.toDataURL(qrData);
        const updatedMeeting = await prisma_1.default.meeting.update({
            where: { id: meeting.id },
            data: { qrCodeUrl },
        });
        // Logging auditoria diretamente
        await prisma_1.default.auditLog.create({
            data: {
                tenantId,
                userId: organizerId,
                action: 'MEETING_CREATED',
                entity: 'Meeting',
                entityId: meeting.id,
                details: JSON.stringify({ title: dto.title })
            }
        });
        return updatedMeeting;
    }
}
exports.CreateMeetingUseCase = CreateMeetingUseCase;
//# sourceMappingURL=CreateMeetingUseCase.js.map