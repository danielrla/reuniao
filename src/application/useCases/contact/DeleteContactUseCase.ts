import prisma from '../../../config/prisma';
import { NotFoundError } from '../../../domain/errors/AppError';

export class DeleteContactUseCase {
    async execute(tenantId: string, ownerId: string, contactId: string) {
        const existing = await prisma.contact.findUnique({ where: { id: contactId, tenantId } });

        if (!existing || existing.ownerId !== ownerId || existing.deletedAt !== null) {
            throw new NotFoundError('Contato não encontrado ou acesso restrito.');
        }

        // Soft delete
        await prisma.contact.update({
            where: { id: contactId },
            data: { deletedAt: new Date() }
        });

        return true;
    }
}
