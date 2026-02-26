"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const minute_controller_1 = require("../controllers/minute.controller");
const router = (0, express_1.Router)();
router.post('/', minute_controller_1.createMinute);
router.get('/:meetingId', minute_controller_1.getMinuteByMeetingId);
router.post('/attachment', minute_controller_1.addAttachment);
exports.default = router;
//# sourceMappingURL=minute.routes.js.map