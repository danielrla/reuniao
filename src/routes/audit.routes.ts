import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Only ADMIN owners can view audit logs
router.use(requireAuth);
router.use(requireRole([UserRole.ADMIN]));

router.get('/', getAuditLogs);

export default router;
