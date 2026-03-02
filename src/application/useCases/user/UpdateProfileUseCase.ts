import prisma from '../../../config/prisma';
import { UpdateProfileDTO } from '../../dtos/UserDTOs';
import { NotFoundError } from '../../../domain/errors/AppError';

export class UpdateProfileUseCase {
    async execute(tenantId: string, userId: string, dto: UpdateProfileDTO) {
        // Validação de isolamento do tenant
        const user = await prisma.user.findFirst({
            where: { id: userId, tenantId }
        });

        if (!user) {
            throw new NotFoundError('Usuário não localizado neste workspace.');
        }

        const updateData: any = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl || null;
        if (dto.personalEmail !== undefined) updateData.personalEmail = dto.personalEmail || null;
        if (dto.professionalEmail !== undefined) updateData.professionalEmail = dto.professionalEmail || null;
        if (dto.phone !== undefined) updateData.phone = dto.phone || null;
        if (dto.company !== undefined) updateData.company = dto.company || null;
        if (dto.mfaEnabled !== undefined) updateData.mfaEnabled = dto.mfaEnabled;
        if (dto.googleClientId !== undefined) updateData.googleClientId = dto.googleClientId || null;
        if (dto.googleClientSecret !== undefined) updateData.googleClientSecret = dto.googleClientSecret || null;
        if (dto.googleRefreshToken !== undefined) updateData.googleRefreshToken = dto.googleRefreshToken || null;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return updatedUser;
    }
}
