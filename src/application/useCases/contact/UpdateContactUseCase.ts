import prisma from '../../../config/prisma';
import { NotFoundError } from '../../../domain/errors/AppError';
import { UpdateContactDTO } from '../../dtos/ContactDTOs';

export class UpdateContactUseCase {
    async execute(tenantId: string, ownerId: string, contactId: string, dto: UpdateContactDTO) {
        const existing = await prisma.contact.findUnique({ where: { id: contactId, tenantId } });

        if (!existing || existing.ownerId !== ownerId || existing.deletedAt !== null) {
            throw new NotFoundError('Contato não encontrado ou acesso restrito.');
        }

        const contact = await prisma.contact.update({
            where: { id: contactId },
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                company: dto.company,
                jobTitle: dto.jobTitle,
                avatarUrl: dto.avatarUrl
            }
        });

        return contact;
    }
}
