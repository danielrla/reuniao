import { Router } from 'express';
import { getTasks, updateTaskStatus, extractTasksFromMinute } from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../interface/middlewares/validateRequest';
import { UpdateTaskStatusDTOSchema, ExtractTasksDTOSchema } from '../application/dtos/TaskDTOs';

const router = Router();

router.use(requireAuth);

// Used for global unified dashboard of tasks with query filters (4.8)
router.get('/', getTasks);
router.put('/:id', validateRequest(UpdateTaskStatusDTOSchema), updateTaskStatus);
router.post('/extract', validateRequest(ExtractTasksDTOSchema), extractTasksFromMinute);

export default router;
