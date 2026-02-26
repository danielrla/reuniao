import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { CreateContactUseCase } from '../application/useCases/contact/CreateContactUseCase';
import { UpdateContactUseCase } from '../application/useCases/contact/UpdateContactUseCase';
import { DeleteContactUseCase } from '../application/useCases/contact/DeleteContactUseCase';

const createContactUseCase = new CreateContactUseCase();
const updateContactUseCase = new UpdateContactUseCase();
const deleteContactUseCase = new DeleteContactUseCase();

export const getContacts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const ownerId = req.user.id;
        const tenantId = req.user.tenantId;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where: { ownerId, tenantId, deletedAt: null },
                orderBy: { name: 'asc' },
                skip,
                take: limit
            }),
            prisma.contact.count({
                where: { ownerId, tenantId, deletedAt: null }
            })
        ]);

        res.status(200).json({
            data: contacts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const createContact = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const contact = await createContactUseCase.execute(req.user.tenantId, req.user.id, req.body);
        res.status(201).json(contact);
    } catch (error) {
        next(error);
    }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        const contact = await updateContactUseCase.execute(req.user.tenantId, req.user.id, String(id), req.body);
        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        await deleteContactUseCase.execute(req.user.tenantId, req.user.id, String(id));
        res.status(200).json({ message: 'Contato excluído com sucesso.' });
    } catch (error) {
        next(error);
    }
};
