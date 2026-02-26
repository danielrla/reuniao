"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Only ADMIN owners can view audit logs
router.use(auth_middleware_1.requireAuth);
router.use((0, rbac_middleware_1.requireRole)([client_1.UserRole.ADMIN]));
router.get('/', audit_controller_1.getAuditLogs);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map