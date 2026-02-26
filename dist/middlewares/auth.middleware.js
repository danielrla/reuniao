"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const admin = __importStar(require("firebase-admin"));
const prisma_1 = __importDefault(require("../config/prisma"));
// Initialize Firebase Admin (Note: Requires FIREBASE_SERVICE_ACCOUNT or similar env, 
// using a stub if not provided for isolated local DEV so it doesn't crash)
try {
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    }
    else {
        // Basic init or stub
        admin.initializeApp({ projectId: 'demo-project' });
    }
}
catch (e) {
    console.log('Firebase Admin already initialized or error.');
}
const requireAuth = async (req, res, next) => {
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
        let decodedToken;
        if (token === 'MOCK_TOKEN') {
            decodedToken = { uid: 'mock-uid-123', email: 'mock@example.com', name: 'Mock User' };
        }
        else {
            decodedToken = await admin.auth().verifyIdToken(token);
        }
        let user = await prisma_1.default.user.findUnique({
            where: { firebaseUid: decodedToken.uid }
        });
        if (!user && decodedToken.email) {
            // Auto-provision user on first authentication
            const domain = decodedToken.email.split('@')[1];
            let tenant = await prisma_1.default.tenant.findUnique({ where: { domain } });
            if (!tenant) {
                tenant = await prisma_1.default.tenant.create({
                    data: { name: domain, domain }
                });
            }
            user = await prisma_1.default.user.create({
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
    }
    catch (error) {
        console.error('Authentication Error:', error);
        return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.middleware.js.map