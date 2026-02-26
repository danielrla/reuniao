import { Router } from 'express';
import { createMinute, getMinuteByMeetingId, addAttachment } from '../controllers/minute.controller';

const router = Router();

router.post('/', createMinute);
router.get('/:meetingId', getMinuteByMeetingId);
router.post('/attachment', addAttachment);

export default router;
