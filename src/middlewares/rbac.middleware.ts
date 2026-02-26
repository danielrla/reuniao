import { Request, Response, NextFunction } from 'express';

// Middleware to enforce RBAC
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): any => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action' });
        }

        next();
    };
};

export const requireMeetingManager = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // Typical RBAC: Admin OR the user who organized the meeting
    // Can be implemented based on the resource route ID
    next();
};
