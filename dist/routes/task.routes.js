"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRequest_1 = require("../interface/middlewares/validateRequest");
const TaskDTOs_1 = require("../application/dtos/TaskDTOs");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// Used for global unified dashboard of tasks with query filters (4.8)
router.get('/', task_controller_1.getTasks);
router.put('/:id', (0, validateRequest_1.validateRequest)(TaskDTOs_1.UpdateTaskStatusDTOSchema), task_controller_1.updateTaskStatus);
router.post('/extract', (0, validateRequest_1.validateRequest)(TaskDTOs_1.ExtractTasksDTOSchema), task_controller_1.extractTasksFromMinute);
exports.default = router;
//# sourceMappingURL=task.routes.js.map