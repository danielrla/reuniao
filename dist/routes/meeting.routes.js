"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meeting_controller_1 = require("../controllers/meeting.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRequest_1 = require("../interface/middlewares/validateRequest");
const MeetingDTOs_1 = require("../application/dtos/MeetingDTOs");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.post('/', (0, validateRequest_1.validateRequest)(MeetingDTOs_1.CreateMeetingDTOSchema), meeting_controller_1.createMeeting);
router.get('/', meeting_controller_1.getMeetings);
router.post('/sync-google', meeting_controller_1.syncGoogleMeetings);
router.put('/:id', (0, validateRequest_1.validateRequest)(MeetingDTOs_1.UpdateMeetingDTOSchema), meeting_controller_1.updateMeeting);
router.delete('/:id', meeting_controller_1.deleteMeeting);
router.post('/attend', meeting_controller_1.registerAttendance);
router.post('/:id/attachments', meeting_controller_1.addAttachment);
router.delete('/:id/attachments/:attachmentId', meeting_controller_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=meeting.routes.js.map