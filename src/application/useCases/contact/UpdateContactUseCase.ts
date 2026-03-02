import prisma from '../../../config/prisma';
import { NotFoundError } from '../../../domain/errors/AppError';
import { UpdateContactDTO } from '../../dtos/ContactDTOs';
import { GoogleContactsService } from '../../../infrastructure/services/GoogleContactsService';

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

        // --- Google Contacts Integration ---
        try {
            const rawExisting = existing as any;
            if (rawExisting.googleContactId) {
                const user = await prisma.user.findUnique({ where: { id: ownerId } });
                if (user?.googleClientId && user?.googleClientSecret && user?.googleRefreshToken) {
                    const googleService = new GoogleContactsService();

                    await googleService.updateContact(
                        {
                            clientId: user.googleClientId,
                            clientSecret: user.googleClientSecret,
                            refreshToken: user.googleRefreshToken
                        },
                        rawExisting.googleContactId,
                        {
                            names: contact.name ? [{ givenName: contact.name }] : undefined,
                            emailAddresses: contact.email ? [{ value: contact.email }] : undefined,
                            phoneNumbers: contact.phone ? [{ value: contact.phone }] : undefined,
                            organizations: contact.company || contact.jobTitle ? [{ name: contact.company || undefined, title: contact.jobTitle || undefined }] : undefined
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Falha silenciosa ao sincronizar atualização com Google Contacts:', error);
        }

        return contact;
    }
}
