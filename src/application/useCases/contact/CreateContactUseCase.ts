import prisma from '../../../config/prisma';
import { CreateContactDTO } from '../../dtos/ContactDTOs';

export class CreateContactUseCase {
    async execute(tenantId: string, ownerId: string, dto: CreateContactDTO) {
        const contact = await prisma.contact.create({
            data: {
                tenantId,
                ownerId,
                name: dto.name,
                email: dto.email || null,
                phone: dto.phone || null,
                company: dto.company || null,
                jobTitle: dto.jobTitle || null,
                avatarUrl: dto.avatarUrl || null
            }
        });

        return contact;
    }
}
