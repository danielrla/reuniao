import prisma from '../../../config/prisma';
import { DomainError } from '../../../domain/errors/AppError';
import { CreateSubordinateDTO } from '../../dtos/UserDTOs';
import { UserRole } from '@prisma/client';

export class CreateSubordinateUseCase {
    async execute(tenantId: string, managerId: string, dto: CreateSubordinateDTO) {
        const existingUser = await prisma.user.findUnique({
            where: {
                tenantId_email: { tenantId, email: dto.email }
            }
        });

        if (existingUser) {
            throw new DomainError('Já existe um usuário com este email neste Workspace.');
        }

        const subordinate = await prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                phone: dto.phone || null,
                company: dto.company || null,
                tenantId,
                managerId,
                role: UserRole.SUBORDINATE
            }
        });

        return subordinate;
    }
}
