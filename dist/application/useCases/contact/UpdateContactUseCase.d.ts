import { UpdateContactDTO } from '../../dtos/ContactDTOs';
export declare class UpdateContactUseCase {
    execute(tenantId: string, ownerId: string, contactId: string, dto: UpdateContactDTO): Promise<{
        email: string | null;
        name: string;
        id: string;
        tenantId: string;
        avatarUrl: string | null;
        phone: string | null;
        company: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        jobTitle: string | null;
        ownerId: string;
    }>;
}
//# sourceMappingURL=UpdateContactUseCase.d.ts.map