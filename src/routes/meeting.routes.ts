import { Router } from 'express';
import { createMeeting, getMeetings, updateMeeting, deleteMeeting, registerAttendance, addAttachment, deleteAttachment, syncGoogleMeetings } from '../controllers/meeting.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../interface/middlewares/validateRequest';
import { CreateMeetingDTOSchema, UpdateMeetingDTOSchema } from '../application/dtos/MeetingDTOs';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(CreateMeetingDTOSchema), createMeeting);
router.get('/', getMeetings);
router.post('/sync-google', syncGoogleMeetings);
router.put('/:id', validateRequest(UpdateMeetingDTOSchema), updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/attend', registerAttendance);
router.post('/:id/attachments', addAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

export default router;
