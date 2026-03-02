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
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.avatarUrl !== undefined)
            updateData.avatarUrl = dto.avatarUrl || null;
        if (dto.personalEmail !== undefined)
            updateData.personalEmail = dto.personalEmail || null;
        if (dto.professionalEmail !== undefined)
            updateData.professionalEmail = dto.professionalEmail || null;
        if (dto.phone !== undefined)
            updateData.phone = dto.phone || null;
        if (dto.company !== undefined)
            updateData.company = dto.company || null;
        if (dto.mfaEnabled !== undefined)
            updateData.mfaEnabled = dto.mfaEnabled;
        if (dto.googleClientId !== undefined)
            updateData.googleClientId = dto.googleClientId || null;
        if (dto.googleClientSecret !== undefined)
            updateData.googleClientSecret = dto.googleClientSecret || null;
        if (dto.googleRefreshToken !== undefined)
            updateData.googleRefreshToken = dto.googleRefreshToken || null;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: updateData
        });
        return updatedUser;
    }
}
exports.UpdateProfileUseCase = UpdateProfileUseCase;
//# sourceMappingURL=UpdateProfileUseCase.js.map