import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import prisma from '../config/prisma';

// Initialize Firebase Admin (Note: Requires FIREBASE_SERVICE_ACCOUNT or similar env, 
// using a stub if not provided for isolated local DEV so it doesn't crash)
try {
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    } else {
        // Basic init or stub
        admin.initializeApp({ projectId: 'demo-project' });
    }
} catch (e) {
    console.log('Firebase Admin already initialized or error.');
}

// Extend Express Request to inject authenticated User
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Empty token' });
        }

        // Verify token using Firebase Admin
        // Stubs out verification if token is "MOCK_TOKEN" for local testing purposes.
        let decodedToken: any;
        if (token === 'MOCK_TOKEN') {
            decodedToken = { uid: 'mock-uid-123', email: 'mock@example.com', name: 'Mock User' };
        } else {
            decodedToken = await admin.auth().verifyIdToken(token);
        }

        let user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid }
        });

        if (!user && decodedToken.email) {
            // Auto-provision user on first authentication
            const domain = decodedToken.email.split('@')[1];
            let tenant = await prisma.tenant.findUnique({ where: { domain } });
            if (!tenant) {
                tenant = await prisma.tenant.create({
                    data: { name: domain, domain }
                });
            }

            user = await prisma.user.create({
                data: {
                    firebaseUid: decodedToken.uid,
                    email: decodedToken.email,
                    name: decodedToken.name || '',
                    tenantId: tenant.id
                }
            });
        }

        if (!user) {
            return res.status(401).json({ error: 'User does not exist in local database' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    }
};
