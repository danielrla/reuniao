"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContactUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
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
        return contact;
    }
}
exports.CreateContactUseCase = CreateContactUseCase;
//# sourceMappingURL=CreateContactUseCase.js.map