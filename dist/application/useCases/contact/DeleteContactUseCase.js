"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteContactUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
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
        return true;
    }
}
exports.DeleteContactUseCase = DeleteContactUseCase;
//# sourceMappingURL=DeleteContactUseCase.js.map