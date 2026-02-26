"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const meeting_routes_1 = __importDefault(require("./meeting.routes"));
const minute_routes_1 = __importDefault(require("./minute.routes"));
const task_routes_1 = __importDefault(require("./task.routes"));
const contact_routes_1 = __importDefault(require("./contact.routes"));
const audit_routes_1 = __importDefault(require("./audit.routes"));
// TODO: Import and map specific routes
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/meetings', meeting_routes_1.default);
router.use('/minutes', minute_routes_1.default);
router.use('/tasks', task_routes_1.default);
router.use('/contacts', contact_routes_1.default);
router.use('/audit', audit_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map