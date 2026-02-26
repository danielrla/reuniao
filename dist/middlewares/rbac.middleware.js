"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMeetingManager = exports.requireRole = void 0;
// Middleware to enforce RBAC
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action' });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireMeetingManager = async (req, res, next) => {
    // Typical RBAC: Admin OR the user who organized the meeting
    // Can be implemented based on the resource route ID
    next();
};
exports.requireMeetingManager = requireMeetingManager;
//# sourceMappingURL=rbac.middleware.js.map