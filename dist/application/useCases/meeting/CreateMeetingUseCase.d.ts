import { CreateMeetingDTO } from '../../dtos/MeetingDTOs';
export declare class CreateMeetingUseCase {
    execute(tenantId: string, organizerId: string, dto: CreateMeetingDTO): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        date: Date;
        type: import(".prisma/client").$Enums.MeetingType;
        title: string;
        description: string | null;
        startTime: Date | null;
        endTime: Date | null;
        location: string | null;
        meetingLink: string | null;
        agenda: string | null;
        qrCodeUrl: string | null;
        version: number;
        organizerId: string;
    }>;
}
//# sourceMappingURL=CreateMeetingUseCase.d.ts.map