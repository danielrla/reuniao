"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getUsers = exports.createSubordinate = exports.updateProfile = exports.getProfile = void 0;
const UpdateProfileUseCase_1 = require("../application/useCases/user/UpdateProfileUseCase");
const CreateSubordinateUseCase_1 = require("../application/useCases/user/CreateSubordinateUseCase");
const prisma_1 = __importDefault(require("../config/prisma"));
const updateProfileUseCase = new UpdateProfileUseCase_1.UpdateProfileUseCase();
const createSubordinateUseCase = new CreateSubordinateUseCase_1.CreateSubordinateUseCase();
const getProfile = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        const user = await updateProfileUseCase.execute(tenantId, userId, req.body);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const createSubordinate = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const managerId = req.user.id;
        const subordinate = await createSubordinateUseCase.execute(tenantId, managerId, req.body);
        res.status(201).json(subordinate);
    }
    catch (error) {
        next(error);
    }
};
exports.createSubordinate = createSubordinate;
const getUsers = async (req, res, next) => {
    try {
        const users = await prisma_1.default.user.findMany({ where: { tenantId: req.user.tenantId } });
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.default.user.findFirst({
            where: { id: String(id), tenantId: req.user.tenantId },
        });
        if (!user) {
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Usuário não encontrado neste Workspace' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=user.controller.js.map