"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const validateRequest_1 = require("../interface/middlewares/validateRequest");
const UserDTOs_1 = require("../application/dtos/UserDTOs");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/me', user_controller_1.getProfile);
router.put('/me', (0, validateRequest_1.validateRequest)(UserDTOs_1.UpdateProfileDTOSchema), user_controller_1.updateProfile);
router.post('/subordinate', (0, rbac_middleware_1.requireRole)([client_1.UserRole.ADMIN]), (0, validateRequest_1.validateRequest)(UserDTOs_1.CreateSubordinateDTOSchema), user_controller_1.createSubordinate);
router.get('/', user_controller_1.getUsers);
router.get('/:id', user_controller_1.getUserById);
exports.default = router;
//# sourceMappingURL=user.routes.js.map