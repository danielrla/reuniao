"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteContactUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
const GoogleContactsService_1 = require("../../../infrastructure/services/GoogleContactsService");
class DeleteContactUseCase {
    async execute(tenantId, ownerId, contactId) {
        const existing = await prisma_1.default.contact.findUnique({ where: { id: contactId, tenantId } });
        if (!existing || existing.ownerId !== ownerId || existing.deletedAt !== null) {
            throw new AppError_1.NotFoundError('Contato não encontrado ou acesso restrito.');
        }
        // Soft delete
        await prisma_1.default.contact.update({
            where: { id: contactId },
            data: { deletedAt: new Date() }
        });
        // --- Google Contacts Integration ---
        try {
            const rawExisting = existing;
            if (rawExisting.googleContactId) {
                const user = await prisma_1.default.user.findUnique({ where: { id: ownerId } });
                if (user?.googleClientId && user?.googleClientSecret && user?.googleRefreshToken) {
                    const googleService = new GoogleContactsService_1.GoogleContactsService();
                    await googleService.deleteContact({
                        clientId: user.googleClientId,
                        clientSecret: user.googleClientSecret,
                        refreshToken: user.googleRefreshToken
                    }, rawExisting.googleContactId);
                }
            }
        }
        catch (error) {
            console.error('Falha silenciosa ao sincronizar exclusão com Google Contacts:', error);
        }
        return true;
    }
}
exports.DeleteContactUseCase = DeleteContactUseCase;
//# sourceMappingURL=DeleteContactUseCase.js.map