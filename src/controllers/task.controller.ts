import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { UpdateTaskStatusUseCase } from '../application/useCases/task/UpdateTaskStatusUseCase';
import { ExtractTasksFromMinuteUseCase } from '../application/useCases/task/ExtractTasksFromMinuteUseCase';

const updateTaskStatusUseCase = new UpdateTaskStatusUseCase();
const extractTasksUseCase = new ExtractTasksFromMinuteUseCase();

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { assigneeId, meetingId, company, status, sortByDueDate } = req.query;

        const filters: any = { tenantId: req.user.tenantId, deletedAt: null };
        if (assigneeId) filters.assigneeId = String(assigneeId);
        if (meetingId) filters.meetingId = String(meetingId);
        if (status) filters.status = String(status);

        if (company) {
            filters.assignee = { company: String(company) };
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50; // Kanban needs more items initially
        const skip = (page - 1) * limit;

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where: filters,
                include: { assignee: true, meeting: { select: { title: true, date: true } } },
                orderBy: sortByDueDate === 'true' ? { dueDate: 'asc' } : { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.task.count({ where: filters })
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
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        const task = await updateTaskStatusUseCase.execute(req.user.tenantId, req.user.id, String(id), req.body);
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};

export const extractTasksFromMinute = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const result = await extractTasksUseCase.execute(req.user.tenantId, req.user.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
