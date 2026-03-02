import prisma from '../../../config/prisma';
import { GoogleContactsService } from '../../../infrastructure/services/GoogleContactsService';
import { NotFoundError } from '../../../domain/errors/AppError';

export class SyncGoogleContactsUseCase {
    async execute(tenantId: string, userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new NotFoundError('Usuário não encontrado.');
        }

        if (!user.googleClientId || !user.googleClientSecret || !user.googleRefreshToken) {
            return { syncedCount: 0, message: 'Integração com Google Contatos não configurada.' };
        }

        const contactsService = new GoogleContactsService();

        const googleContacts = await contactsService.listContacts({
            clientId: user.googleClientId,
            clientSecret: user.googleClientSecret,
            refreshToken: user.googleRefreshToken
        });

        let syncedCount = 0;

        for (const person of googleContacts) {
            if (!person.resourceName) continue;

            const existingContact = await prisma.contact.findFirst({
                where: {
                    googleContactId: person.resourceName,
                    tenantId,
                    ownerId: userId
                }
            });

            if (!existingContact) {
                const name = person.names?.[0]?.displayName || 'Contato sem nome (Google)';
                const email = person.emailAddresses?.[0]?.value || null;
                const phone = person.phoneNumbers?.[0]?.value || null;
                const company = person.organizations?.[0]?.name || null;
                const jobTitle = person.organizations?.[0]?.title || null;

                // Ignorar contatos totalmente vazios
                if (!email && !phone) continue;

                await prisma.contact.create({
                    data: {
                        tenantId,
                        ownerId: userId,
                        name,
                        email,
                        phone,
                        company,
                        jobTitle,
                        googleContactId: person.resourceName
                    }
                });

                syncedCount++;
            }
        }

        return { syncedCount, message: `Sincronização concluída. ${syncedCount} contatos importados.` };
    }
}
