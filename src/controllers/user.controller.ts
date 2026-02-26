import { Request, Response, NextFunction } from 'express';
import { UpdateProfileUseCase } from '../application/useCases/user/UpdateProfileUseCase';
import { CreateSubordinateUseCase } from '../application/useCases/user/CreateSubordinateUseCase';
import prisma from '../config/prisma';

const updateProfileUseCase = new UpdateProfileUseCase();
const createSubordinateUseCase = new CreateSubordinateUseCase();

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        const user = await updateProfileUseCase.execute(tenantId, userId, req.body);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const createSubordinate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const tenantId = req.user.tenantId;
        const managerId = req.user.id;
        const subordinate = await createSubordinateUseCase.execute(tenantId, managerId, req.body);
        res.status(201).json(subordinate);
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const users = await prisma.user.findMany({ where: { tenantId: req.user.tenantId } });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findFirst({
            where: { id: String(id), tenantId: req.user.tenantId },
        });

        if (!user) {
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Usuário não encontrado neste Workspace' });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
