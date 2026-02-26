import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const loginWithGoogle = async (req: Request, res: Response) => {
    // TODO: Implement actual Google OAuth Flow (e.g. check ID token from headers)
    // For now, mocking the login endpoint
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        let user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            const domain = email.split('@')[1] || 'default.com';
            let tenant = await prisma.tenant.findUnique({ where: { domain } });
            if (!tenant) {
                tenant = await prisma.tenant.create({ data: { name: domain, domain } });
            }
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    tenantId: tenant.id
                }
            });
        }

        // TODO: generate JWT token or session
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
