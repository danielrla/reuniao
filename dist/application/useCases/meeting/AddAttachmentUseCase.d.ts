export declare class AddAttachmentUseCase {
    execute(tenantId: string, userId: string, managerId: string | null, meetingId: string, data: {
        fileName: string;
        fileUrl: string;
        fileType?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        fileName: string;
        fileUrl: string;
        fileType: string | null;
        meetingId: string;
    }>;
}
//# sourceMappingURL=AddAttachmentUseCase.d.ts.map