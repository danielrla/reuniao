"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTasksFromMinute = exports.updateTaskStatus = exports.getTasks = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const UpdateTaskStatusUseCase_1 = require("../application/useCases/task/UpdateTaskStatusUseCase");
const ExtractTasksFromMinuteUseCase_1 = require("../application/useCases/task/ExtractTasksFromMinuteUseCase");
const updateTaskStatusUseCase = new UpdateTaskStatusUseCase_1.UpdateTaskStatusUseCase();
const extractTasksUseCase = new ExtractTasksFromMinuteUseCase_1.ExtractTasksFromMinuteUseCase();
const getTasks = async (req, res, next) => {
    try {
        const { assigneeId, meetingId, company, status, sortByDueDate } = req.query;
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
        const tasks = await prisma_1.default.task.findMany({
            where: filters,
            include: { assignee: true, meeting: { select: { title: true, date: true } } },
            orderBy: sortByDueDate === 'true' ? { dueDate: 'asc' } : { createdAt: 'desc' }
        });
        res.status(200).json(tasks);
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