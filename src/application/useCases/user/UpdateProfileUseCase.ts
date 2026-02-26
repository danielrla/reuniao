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

        const updatedUser = await prisma.user.update({
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
