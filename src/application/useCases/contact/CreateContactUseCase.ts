import prisma from '../../../config/prisma';
import { CreateContactDTO } from '../../dtos/ContactDTOs';
import { GoogleContactsService } from '../../../infrastructure/services/GoogleContactsService';

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

        // --- Google Contacts Integration ---
        try {
            const user = await prisma.user.findUnique({ where: { id: ownerId } });
            if (user?.googleClientId && user?.googleClientSecret && user?.googleRefreshToken) {
                const googleService = new GoogleContactsService();

                const resourceName = await googleService.createContact(
                    {
                        clientId: user.googleClientId,
                        clientSecret: user.googleClientSecret,
                        refreshToken: user.googleRefreshToken
                    },
                    {
                        names: dto.name ? [{ givenName: dto.name }] : undefined,
                        emailAddresses: dto.email ? [{ value: dto.email }] : undefined,
                        phoneNumbers: dto.phone ? [{ value: dto.phone }] : undefined,
                        organizations: dto.company || dto.jobTitle ? [{ name: dto.company || undefined, title: dto.jobTitle || undefined }] : undefined
                    }
                );

                if (resourceName) {
                    await prisma.contact.update({
                        where: { id: contact.id },
                        data: { googleContactId: resourceName }
                    });
                }
            }
        } catch (error) {
            console.error('Falha silenciosa ao sincronizar criação com Google Contacts:', error);
        }

        return contact;
    }
}
