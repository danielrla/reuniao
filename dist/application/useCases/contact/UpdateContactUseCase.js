"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
const GoogleContactsService_1 = require("../../../infrastructure/services/GoogleContactsService");
class UpdateContactUseCase {
    async execute(tenantId, ownerId, contactId, dto) {
        const existing = await prisma_1.default.contact.findUnique({ where: { id: contactId, tenantId } });
        if (!existing || existing.ownerId !== ownerId || existing.deletedAt !== null) {
            throw new AppError_1.NotFoundError('Contato não encontrado ou acesso restrito.');
        }
        const contact = await prisma_1.default.contact.update({
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
            const rawExisting = existing;
            if (rawExisting.googleContactId) {
                const user = await prisma_1.default.user.findUnique({ where: { id: ownerId } });
                if (user?.googleClientId && user?.googleClientSecret && user?.googleRefreshToken) {
                    const googleService = new GoogleContactsService_1.GoogleContactsService();
                    await googleService.updateContact({
                        clientId: user.googleClientId,
                        clientSecret: user.googleClientSecret,
                        refreshToken: user.googleRefreshToken
                    }, rawExisting.googleContactId, {
                        names: contact.name ? [{ givenName: contact.name }] : undefined,
                        emailAddresses: contact.email ? [{ value: contact.email }] : undefined,
                        phoneNumbers: contact.phone ? [{ value: contact.phone }] : undefined,
                        organizations: contact.company || contact.jobTitle ? [{ name: contact.company || undefined, title: contact.jobTitle || undefined }] : undefined
                    });
                }
            }
        }
        catch (error) {
            console.error('Falha silenciosa ao sincronizar atualização com Google Contacts:', error);
        }
        return contact;
    }
}
exports.UpdateContactUseCase = UpdateContactUseCase;
//# sourceMappingURL=UpdateContactUseCase.js.map