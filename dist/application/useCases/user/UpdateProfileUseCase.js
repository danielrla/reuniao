"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
class UpdateProfileUseCase {
    async execute(tenantId, userId, dto) {
        // Validação de isolamento do tenant
        const user = await prisma_1.default.user.findFirst({
            where: { id: userId, tenantId }
        });
        if (!user) {
            throw new AppError_1.NotFoundError('Usuário não localizado neste workspace.');
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                name: dto.name,
                avatarUrl: dto.avatarUrl || null,
                personalEmail: dto.personalEmail || null,
                professionalEmail: dto.professionalEmail || null,
                phone: dto.phone || null,
                company: dto.company || null,
                mfaEnabled: dto.mfaEnabled
            }
        });
        return updatedUser;
    }
}
exports.UpdateProfileUseCase = UpdateProfileUseCase;
//# sourceMappingURL=UpdateProfileUseCase.js.map