"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContactUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const GoogleContactsService_1 = require("../../../infrastructure/services/GoogleContactsService");
class CreateContactUseCase {
    async execute(tenantId, ownerId, dto) {
        const contact = await prisma_1.default.contact.create({
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
            const user = await prisma_1.default.user.findUnique({ where: { id: ownerId } });
            if (user?.googleClientId && user?.googleClientSecret && user?.googleRefreshToken) {
                const googleService = new GoogleContactsService_1.GoogleContactsService();
                const resourceName = await googleService.createContact({
                    clientId: user.googleClientId,
                    clientSecret: user.googleClientSecret,
                    refreshToken: user.googleRefreshToken
                }, {
                    names: dto.name ? [{ givenName: dto.name }] : undefined,
                    emailAddresses: dto.email ? [{ value: dto.email }] : undefined,
                    phoneNumbers: dto.phone ? [{ value: dto.phone }] : undefined,
                    organizations: dto.company || dto.jobTitle ? [{ name: dto.company || undefined, title: dto.jobTitle || undefined }] : undefined
                });
                if (resourceName) {
                    await prisma_1.default.contact.update({
                        where: { id: contact.id },
                        data: { googleContactId: resourceName }
                    });
                }
            }
        }
        catch (error) {
            console.error('Falha silenciosa ao sincronizar criação com Google Contacts:', error);
        }
        return contact;
    }
}
exports.CreateContactUseCase = CreateContactUseCase;
//# sourceMappingURL=CreateContactUseCase.js.map