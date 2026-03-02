import { CreateSubordinateDTO } from '../../dtos/UserDTOs';
export declare class CreateSubordinateUseCase {
    execute(tenantId: string, managerId: string, dto: CreateSubordinateDTO): Promise<{
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
//# sourceMappingURL=CreateSubordinateUseCase.d.ts.map