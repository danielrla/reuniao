"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.updateContact = exports.createContact = exports.getContacts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const CreateContactUseCase_1 = require("../application/useCases/contact/CreateContactUseCase");
const UpdateContactUseCase_1 = require("../application/useCases/contact/UpdateContactUseCase");
const DeleteContactUseCase_1 = require("../application/useCases/contact/DeleteContactUseCase");
const createContactUseCase = new CreateContactUseCase_1.CreateContactUseCase();
const updateContactUseCase = new UpdateContactUseCase_1.UpdateContactUseCase();
const deleteContactUseCase = new DeleteContactUseCase_1.DeleteContactUseCase();
const getContacts = async (req, res, next) => {
    try {
        const ownerId = req.user.id;
        const tenantId = req.user.tenantId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const contacts = await prisma_1.default.contact.findMany({
            where: { ownerId, tenantId, deletedAt: null },
            orderBy: { name: 'asc' },
            skip,
            take: limit
        });
        res.status(200).json(contacts);
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
        res.status(200).json({ message: 'Contato excluído com sucesso.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteContact = deleteContact;
//# sourceMappingURL=contact.controller.js.map