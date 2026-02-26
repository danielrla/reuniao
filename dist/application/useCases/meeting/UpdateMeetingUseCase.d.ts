export declare class UpdateMeetingUseCase {
    execute(tenantId: string, userId: string, managerId: string | null, meetingId: string, updateData: any): Promise<{
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
//# sourceMappingURL=UpdateMeetingUseCase.d.ts.map