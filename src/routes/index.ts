import { Router } from 'express';

const router = Router();

import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import meetingRoutes from './meeting.routes';
import minuteRoutes from './minute.routes';
import taskRoutes from './task.routes';
import contactRoutes from './contact.routes';
import auditRoutes from './audit.routes';

// TODO: Import and map specific routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/meetings', meetingRoutes);
router.use('/minutes', minuteRoutes);
router.use('/tasks', taskRoutes);
router.use('/contacts', contactRoutes);
router.use('/audit', auditRoutes);

export default router;
