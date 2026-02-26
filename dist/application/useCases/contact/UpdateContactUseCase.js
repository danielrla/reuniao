"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
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
        return contact;
    }
}
exports.UpdateContactUseCase = UpdateContactUseCase;
//# sourceMappingURL=UpdateContactUseCase.js.map