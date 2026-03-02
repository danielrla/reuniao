import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { CreateContactUseCase } from '../application/useCases/contact/CreateContactUseCase';
import { UpdateContactUseCase } from '../application/useCases/contact/UpdateContactUseCase';
import { DeleteContactUseCase } from '../application/useCases/contact/DeleteContactUseCase';
import { ImportContactsUseCase } from '../application/useCases/contact/ImportContactsUseCase';
import { SyncGoogleContactsUseCase } from '../application/useCases/contact/SyncGoogleContactsUseCase';

const createContactUseCase = new CreateContactUseCase();
const updateContactUseCase = new UpdateContactUseCase();
const deleteContactUseCase = new DeleteContactUseCase();
const importContactsUseCase = new ImportContactsUseCase();
const syncGoogleContactsUseCase = new SyncGoogleContactsUseCase();

export const getContacts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const ownerId = req.user.id;
        const tenantId = req.user.tenantId;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { name, email, phone, company } = req.query;

        const whereClause: any = { ownerId, tenantId, deletedAt: null };

        if (name) whereClause.name = { contains: String(name), mode: 'insensitive' };
        if (email) whereClause.email = { contains: String(email), mode: 'insensitive' };
        if (phone) whereClause.phone = { contains: String(phone), mode: 'insensitive' };
        if (company) whereClause.company = { contains: String(company), mode: 'insensitive' };

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where: whereClause,
                orderBy: { name: 'asc' },
                skip,
                take: limit
            }),
            prisma.contact.count({
                where: whereClause
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
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const importContacts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { contacts } = req.body;
        if (!Array.isArray(contacts)) {
            return res.status(400).json({ message: 'O payload deve conter um array "contacts".' });
        }
        const result = await importContactsUseCase.execute(req.user.tenantId, req.user.id, contacts);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const syncGoogleContacts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const result = await syncGoogleContactsUseCase.execute(req.user.tenantId, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
