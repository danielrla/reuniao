"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithGoogle = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const loginWithGoogle = async (req, res) => {
    // TODO: Implement actual Google OAuth Flow (e.g. check ID token from headers)
    // For now, mocking the login endpoint
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        let user = await prisma_1.default.user.findFirst({
            where: { email },
        });
        if (!user) {
            const domain = email.split('@')[1] || 'default.com';
            let tenant = await prisma_1.default.tenant.findUnique({ where: { domain } });
            if (!tenant) {
                tenant = await prisma_1.default.tenant.create({ data: { name: domain, domain } });
            }
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    tenantId: tenant.id
                }
            });
        }
        // TODO: generate JWT token or session
        res.status(200).json({ message: 'Login successful', user });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.loginWithGoogle = loginWithGoogle;
//# sourceMappingURL=auth.controller.js.map