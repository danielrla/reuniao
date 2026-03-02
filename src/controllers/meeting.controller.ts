import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { CreateMeetingUseCase } from '../application/useCases/meeting/CreateMeetingUseCase';
import { UpdateMeetingUseCase } from '../application/useCases/meeting/UpdateMeetingUseCase';
import { DeleteMeetingUseCase } from '../application/useCases/meeting/DeleteMeetingUseCase';
import { AddAttachmentUseCase } from '../application/useCases/meeting/AddAttachmentUseCase';
import { DeleteAttachmentUseCase } from '../application/useCases/meeting/DeleteAttachmentUseCase';
import { SyncGoogleMeetingsUseCase } from '../application/useCases/meeting/SyncGoogleMeetingsUseCase';

const createMeetingUseCase = new CreateMeetingUseCase();
const updateMeetingUseCase = new UpdateMeetingUseCase();
const deleteMeetingUseCase = new DeleteMeetingUseCase();
const addAttachmentUseCase = new AddAttachmentUseCase();
const deleteAttachmentUseCase = new DeleteAttachmentUseCase();
const syncGoogleMeetingsUseCase = new SyncGoogleMeetingsUseCase();

export const createMeeting = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const meeting = await createMeetingUseCase.execute(req.user.tenantId, req.user.id, req.body);
        res.status(201).json(meeting);
    } catch (error) {
        next(error);
    }
};

export const updateMeeting = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        const meeting = await updateMeetingUseCase.execute(req.user.tenantId, req.user.id, req.user.managerId, String(id), req.body);
        res.status(200).json(meeting);
    } catch (error) {
        next(error);
    }
};

export const deleteMeeting = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        await deleteMeetingUseCase.execute(req.user.tenantId, req.user.id, req.user.managerId, String(id));
        res.status(200).json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { startDate, endDate, type, status } = req.query;

        const where: any = { tenantId: req.user.tenantId, deletedAt: null };

        if (status) where.status = status as string;
        if (type) where.type = type as 'ONLINE' | 'IN_PERSON';

        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                const sDate = new Date(startDate as string);
                sDate.setUTCHours(0, 0, 0, 0);
                where.date.gte = sDate;
            }
            if (endDate) {
                const eDate = new Date(endDate as string);
                eDate.setUTCHours(23, 59, 59, 999);
                where.date.lte = eDate;
            }
        }

        const [meetings, total] = await Promise.all([
            prisma.meeting.findMany({
                where,
                include: {
                    organizer: { select: { id: true, name: true, avatarUrl: true } },
                    contacts: true,
                    attachments: true
                },
                orderBy: { date: 'asc' },
                skip,
                take: limit
            }),
            prisma.meeting.count({
                where
            })
        ]);

        res.status(200).json({
            data: meetings,
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

export const registerAttendance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { meetingId, userId } = req.body;

        if (!meetingId || !userId) {
            return res.status(400).json({ code: 'BAD_REQUEST', message: 'Missing meetingId or userId' });
        }

        const meeting = await prisma.meeting.findUnique({ where: { id: String(meetingId), tenantId: req.user.tenantId } });

        if (!meeting || meeting.deletedAt !== null) {
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Workspace meeting not found' });
        }

        if (meeting.endTime && new Date() > new Date(meeting.endTime)) {
            return res.status(400).json({ code: 'VALIDATION_FAILED', message: 'Cannot register attendance: Meeting has officially ended' });
        }

        const attendance = await prisma.attendance.create({
            data: { meetingId, userId },
        });

        res.status(201).json({ message: 'Attendance registered', attendance });
    } catch (error) {
        next(error);
    }
};

export const addAttachment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params;
        const attachment = await addAttachmentUseCase.execute(req.user.tenantId, req.user.id, req.user.managerId, String(id), req.body);
        res.status(201).json(attachment);
    } catch (error) {
        next(error);
    }
};

export const deleteAttachment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id, attachmentId } = req.params;
        await deleteAttachmentUseCase.execute(req.user.tenantId, req.user.id, req.user.managerId, String(id), String(attachmentId));
        res.status(200).json({ message: 'Attachment deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const syncGoogleMeetings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const result = await syncGoogleMeetingsUseCase.execute(req.user.tenantId, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
