"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubordinateUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const AppError_1 = require("../../../domain/errors/AppError");
const client_1 = require("@prisma/client");
class CreateSubordinateUseCase {
    async execute(tenantId, managerId, dto) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                tenantId_email: { tenantId, email: dto.email }
            }
        });
        if (existingUser) {
            throw new AppError_1.DomainError('Já existe um usuário com este email neste Workspace.');
        }
        const subordinate = await prisma_1.default.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                phone: dto.phone || null,
                company: dto.company || null,
                tenantId,
                managerId,
                role: client_1.UserRole.SUBORDINATE
            }
        });
        return subordinate;
    }
}
exports.CreateSubordinateUseCase = CreateSubordinateUseCase;
//# sourceMappingURL=CreateSubordinateUseCase.js.map