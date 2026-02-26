"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAttendance = exports.getMeetings = exports.deleteMeeting = exports.updateMeeting = exports.createMeeting = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const CreateMeetingUseCase_1 = require("../application/useCases/meeting/CreateMeetingUseCase");
const UpdateMeetingUseCase_1 = require("../application/useCases/meeting/UpdateMeetingUseCase");
const DeleteMeetingUseCase_1 = require("../application/useCases/meeting/DeleteMeetingUseCase");
const createMeetingUseCase = new CreateMeetingUseCase_1.CreateMeetingUseCase();
const updateMeetingUseCase = new UpdateMeetingUseCase_1.UpdateMeetingUseCase();
const deleteMeetingUseCase = new DeleteMeetingUseCase_1.DeleteMeetingUseCase();
const createMeeting = async (req, res, next) => {
    try {
        const meeting = await createMeetingUseCase.execute(req.user.tenantId, req.user.id, req.body);
        res.status(201).json(meeting);
    }
    catch (error) {
        next(error);
    }
};
exports.createMeeting = createMeeting;
const updateMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const meeting = await updateMeetingUseCase.execute(req.user.tenantId, req.user.id, req.user.managerId, String(id), req.body);
        res.status(200).json(meeting);
    }
    catch (error) {
        next(error);
    }
};
exports.updateMeeting = updateMeeting;
const deleteMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteMeetingUseCase.execute(req.user.tenantId, req.user.id, req.user.managerId, String(id));
        res.status(200).json({ message: 'Meeting deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMeeting = deleteMeeting;
const getMeetings = async (req, res, next) => {
    try {
        // Implementação paginada básica com filtro de tenant e soft delete
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const meetings = await prisma_1.default.meeting.findMany({
            where: { tenantId: req.user.tenantId, deletedAt: null },
            include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { date: 'desc' },
            skip,
            take: limit
        });
        res.status(200).json(meetings);
    }
    catch (error) {
        next(error);
    }
};
exports.getMeetings = getMeetings;
const registerAttendance = async (req, res, next) => {
    try {
        const { meetingId, userId } = req.body;
        if (!meetingId || !userId) {
            return res.status(400).json({ code: 'BAD_REQUEST', message: 'Missing meetingId or userId' });
        }
        const meeting = await prisma_1.default.meeting.findUnique({ where: { id: String(meetingId), tenantId: req.user.tenantId } });
        if (!meeting || meeting.deletedAt !== null) {
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Workspace meeting not found' });
        }
        if (meeting.endTime && new Date() > new Date(meeting.endTime)) {
            return res.status(400).json({ code: 'VALIDATION_FAILED', message: 'Cannot register attendance: Meeting has officially ended' });
        }
        const attendance = await prisma_1.default.attendance.create({
            data: { meetingId, userId },
        });
        res.status(201).json({ message: 'Attendance registered', attendance });
    }
    catch (error) {
        next(error);
    }
};
exports.registerAttendance = registerAttendance;
//# sourceMappingURL=meeting.controller.js.map