"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncGoogleContacts = exports.importContacts = exports.deleteContact = exports.updateContact = exports.createContact = exports.getContacts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const CreateContactUseCase_1 = require("../application/useCases/contact/CreateContactUseCase");
const UpdateContactUseCase_1 = require("../application/useCases/contact/UpdateContactUseCase");
const DeleteContactUseCase_1 = require("../application/useCases/contact/DeleteContactUseCase");
const ImportContactsUseCase_1 = require("../application/useCases/contact/ImportContactsUseCase");
const SyncGoogleContactsUseCase_1 = require("../application/useCases/contact/SyncGoogleContactsUseCase");
const createContactUseCase = new CreateContactUseCase_1.CreateContactUseCase();
const updateContactUseCase = new UpdateContactUseCase_1.UpdateContactUseCase();
const deleteContactUseCase = new DeleteContactUseCase_1.DeleteContactUseCase();
const importContactsUseCase = new ImportContactsUseCase_1.ImportContactsUseCase();
const syncGoogleContactsUseCase = new SyncGoogleContactsUseCase_1.SyncGoogleContactsUseCase();
const getContacts = async (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const tenantId = req.user.tenantId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { name, email, phone, company } = req.query;
        const whereClause = { ownerId, tenantId, deletedAt: null };
        if (name)
            whereClause.name = { contains: String(name), mode: 'insensitive' };
        if (email)
            whereClause.email = { contains: String(email), mode: 'insensitive' };
        if (phone)
            whereClause.phone = { contains: String(phone), mode: 'insensitive' };
        if (company)
            whereClause.company = { contains: String(company), mode: 'insensitive' };
        const [contacts, total] = await Promise.all([
            prisma_1.default.contact.findMany({
                where: whereClause,
                orderBy: { name: 'asc' },
                skip,
                take: limit
            }),
            prisma_1.default.contact.count({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getContacts = getContacts;
const createContact = async (req, res, next) => {
    try {
        const contact = await createContactUseCase.execute(req.user.tenantId, req.user.id, req.body);
        res.status(201).json(contact);
    }
    catch (error) {
        next(error);
    }
};
exports.createContact = createContact;
const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await updateContactUseCase.execute(req.user.tenantId, req.user.id, String(id), req.body);
        res.status(200).json(contact);
    }
    catch (error) {
        next(error);
    }
};
exports.updateContact = updateContact;
const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteContactUseCase.execute(req.user.tenantId, req.user.id, String(id));
        res.status(200).json({ message: 'Contact deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteContact = deleteContact;
const importContacts = async (req, res, next) => {
    try {
        const { contacts } = req.body;
        if (!Array.isArray(contacts)) {
            return res.status(400).json({ message: 'O payload deve conter um array "contacts".' });
        }
        const result = await importContactsUseCase.execute(req.user.tenantId, req.user.id, contacts);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.importContacts = importContacts;
const syncGoogleContacts = async (req, res, next) => {
    try {
        const result = await syncGoogleContactsUseCase.execute(req.user.tenantId, req.user.id);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.syncGoogleContacts = syncGoogleContacts;
//# sourceMappingURL=contact.controller.js.map