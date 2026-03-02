"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTasksFromMinute = exports.createTask = exports.updateTaskStatus = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const UpdateTaskStatusUseCase_1 = require("../application/useCases/task/UpdateTaskStatusUseCase");
const ExtractTasksFromMinuteUseCase_1 = require("../application/useCases/task/ExtractTasksFromMinuteUseCase");
const CreateTaskUseCase_1 = require("../application/useCases/task/CreateTaskUseCase");
const updateTaskStatusUseCase = new UpdateTaskStatusUseCase_1.UpdateTaskStatusUseCase();
const extractTasksUseCase = new ExtractTasksFromMinuteUseCase_1.ExtractTasksFromMinuteUseCase();
const createTaskUseCase = new CreateTaskUseCase_1.CreateTaskUseCase();
const getTasks = async (req, res, next) => {
    try {
        const { assigneeId, meetingId, company, status, sortByDueDate, date } = req.query;
        const filters = { tenantId: req.user.tenantId, deletedAt: null };
        if (assigneeId)
            filters.assigneeId = String(assigneeId);
        if (meetingId)
            filters.meetingId = String(meetingId);
        if (status)
            filters.status = String(status);
        if (company) {
            filters.assignee = { company: String(company) };
        }
        if (date) {
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);
            filters.dueDate = {
                gte: startOfDay,
                lte: endOfDay
            };
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Requisito do usuario: unificar em 10
        const skip = (page - 1) * limit;
        const [tasks, total] = await Promise.all([
            prisma_1.default.task.findMany({
                where: filters,
                include: { assignee: true, meeting: { select: { title: true, date: true } } },
                orderBy: sortByDueDate === 'true' ? { dueDate: 'asc' } : { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.task.count({ where: filters })
        ]);
        res.status(200).json({
            data: tasks,
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
exports.getTasks = getTasks;
const updateTaskStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await updateTaskStatusUseCase.execute(req.user.tenantId, req.user.id, String(id), req.body);
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTaskStatus = updateTaskStatus;
const createTask = async (req, res, next) => {
    try {
        const task = await createTaskUseCase.execute(req.user.tenantId, req.user.id, req.body);
        res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const extractTasksFromMinute = async (req, res, next) => {
    try {
        const result = await extractTasksUseCase.execute(req.user.tenantId, req.user.id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.extractTasksFromMinute = extractTasksFromMinute;
//# sourceMappingURL=task.controller.js.map