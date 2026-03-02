"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncGoogleContactsUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const GoogleContactsService_1 = require("../../../infrastructure/services/GoogleContactsService");
const AppError_1 = require("../../../domain/errors/AppError");
class SyncGoogleContactsUseCase {
    async execute(tenantId, userId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new AppError_1.NotFoundError('Usuário não encontrado.');
        }
        if (!user.googleClientId || !user.googleClientSecret || !user.googleRefreshToken) {
            return { syncedCount: 0, message: 'Integração com Google Contatos não configurada.' };
        }
        const contactsService = new GoogleContactsService_1.GoogleContactsService();
        const googleContacts = await contactsService.listContacts({
            clientId: user.googleClientId,
            clientSecret: user.googleClientSecret,
            refreshToken: user.googleRefreshToken
        });
        let syncedCount = 0;
        for (const person of googleContacts) {
            if (!person.resourceName)
                continue;
            const existingContact = await prisma_1.default.contact.findFirst({
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
                if (!email && !phone)
                    continue;
                await prisma_1.default.contact.create({
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
exports.SyncGoogleContactsUseCase = SyncGoogleContactsUseCase;
//# sourceMappingURL=SyncGoogleContactsUseCase.js.map