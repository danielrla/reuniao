"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAttachment = exports.getMinuteByMeetingId = exports.createMinute = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createMinute = async (req, res) => {
    try {
        const { meetingId, transcript } = req.body;
        if (!meetingId) {
            return res.status(400).json({ error: 'Meeting ID is required' });
        }
        const minute = await prisma_1.default.minute.create({
            data: {
                meetingId,
                transcript,
            }
        });
        // TODO: Publish event to Pub/Sub to trigger Vertex AI processing
        // e.g. publishMessage('meeting-summarize-topic', { minuteId: minute.id });
        res.status(201).json(minute);
    }
    catch (error) {
        console.error('Error creating minute:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createMinute = createMinute;
const getMinuteByMeetingId = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const minute = await prisma_1.default.minute.findUnique({
            where: { meetingId: String(meetingId) },
        });
        if (!minute)
            return res.status(404).json({ error: 'Minute not found' });
        res.status(200).json(minute);
    }
    catch (error) {
        console.error('Error fetching minute:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getMinuteByMeetingId = getMinuteByMeetingId;
const addAttachment = async (req, res) => {
    // Mock file upload handling (usually done via multer middleware)
    try {
        const { meetingId, fileName, fileUrl, fileType } = req.body;
        if (!meetingId || !fileUrl) {
            return res.status(400).json({ error: 'Meeting ID and File URL are required' });
        }
        const attachment = await prisma_1.default.attachment.create({
            data: {
                meetingId,
                fileName: fileName || 'attachment',
                fileUrl,
                fileType,
            }
        });
        res.status(201).json(attachment);
    }
    catch (error) {
        console.error('Error adding attachment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.addAttachment = addAttachment;
//# sourceMappingURL=minute.controller.js.map