import { Router } from 'express';
import { createMeeting, getMeetings, updateMeeting, deleteMeeting, registerAttendance } from '../controllers/meeting.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../interface/middlewares/validateRequest';
import { CreateMeetingDTOSchema, UpdateMeetingDTOSchema } from '../application/dtos/MeetingDTOs';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(CreateMeetingDTOSchema), createMeeting);
router.get('/', getMeetings);
router.put('/:id', validateRequest(UpdateMeetingDTOSchema), updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/attend', registerAttendance);

export default router;
