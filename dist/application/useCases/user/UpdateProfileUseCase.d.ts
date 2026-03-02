import { UpdateProfileDTO } from '../../dtos/UserDTOs';
export declare class UpdateProfileUseCase {
    execute(tenantId: string, userId: string, dto: UpdateProfileDTO): Promise<{
        email: string;
        name: string | null;
        id: string;
        tenantId: string;
        firebaseUid: string | null;
        avatarUrl: string | null;
        personalEmail: string | null;
        professionalEmail: string | null;
        phone: string | null;
        company: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        mfaEnabled: boolean;
        mfaSecret: string | null;
        googleClientId: string | null;
        googleClientSecret: string | null;
        googleRefreshToken: string | null;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
//# sourceMappingURL=UpdateProfileUseCase.d.ts.map