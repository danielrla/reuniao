import prisma from '../../../config/prisma';
import QRCode from 'qrcode';
import { CreateMeetingDTO } from '../../dtos/MeetingDTOs';

export class CreateMeetingUseCase {
    async execute(tenantId: string, organizerId: string, dto: CreateMeetingDTO) {
        const meeting = await prisma.meeting.create({
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
                tenantId,
                contacts: dto.contactIds && dto.contactIds.length > 0
                    ? { connect: dto.contactIds.map(id => ({ id })) }
                    : undefined
            },
        });

        const qrData = JSON.stringify({ meetingId: meeting.id, tenantId });
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        const updatedMeeting = await prisma.meeting.update({
            where: { id: meeting.id },
            data: { qrCodeUrl },
        });

        // Logging auditoria diretamente
        await prisma.auditLog.create({
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
