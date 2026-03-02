import prisma from '../../../config/prisma';
import { NotFoundError } from '../../../domain/errors/AppError';
import { GoogleContactsService } from '../../../infrastructure/services/GoogleContactsService';

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

        // --- Google Contacts Integration ---
        try {
            const rawExisting = existing as any;
            if (rawExisting.googleContactId) {
                const user = await prisma.user.findUnique({ where: { id: ownerId } });
                if (user?.googleClientId && user?.googleClientSecret && user?.googleRefreshToken) {
                    const googleService = new GoogleContactsService();
                    await googleService.deleteContact(
                        {
                            clientId: user.googleClientId,
                            clientSecret: user.googleClientSecret,
                            refreshToken: user.googleRefreshToken
                        },
                        rawExisting.googleContactId
                    );
                }
            }
        } catch (error) {
            console.error('Falha silenciosa ao sincronizar exclusão com Google Contacts:', error);
        }

        return true;
    }
}
