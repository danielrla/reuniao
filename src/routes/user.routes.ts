import { Router } from 'express';
import { getUsers, getUserById, getProfile, updateProfile, createSubordinate } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validateRequest } from '../interface/middlewares/validateRequest';
import { UpdateProfileDTOSchema, CreateSubordinateDTOSchema } from '../application/dtos/UserDTOs';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/me', getProfile);
router.put('/me', validateRequest(UpdateProfileDTOSchema), updateProfile);
router.post('/subordinate', requireRole([UserRole.ADMIN]), validateRequest(CreateSubordinateDTOSchema), createSubordinate);

router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;
