import { CreateContactDTO } from '../../dtos/ContactDTOs';
export declare class CreateContactUseCase {
    execute(tenantId: string, ownerId: string, dto: CreateContactDTO): Promise<{
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
//# sourceMappingURL=CreateContactUseCase.d.ts.map