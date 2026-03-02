"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRequest_1 = require("../interface/middlewares/validateRequest");
const ContactDTOs_1 = require("../application/dtos/ContactDTOs");
const router = (0, express_1.Router)();
// Protect all contact routes
router.use(auth_middleware_1.requireAuth);
router.get('/', contact_controller_1.getContacts);
router.post('/import', contact_controller_1.importContacts);
router.post('/sync-google', contact_controller_1.syncGoogleContacts);
router.post('/', (0, validateRequest_1.validateRequest)(ContactDTOs_1.CreateContactDTOSchema), contact_controller_1.createContact);
router.put('/:id', (0, validateRequest_1.validateRequest)(ContactDTOs_1.UpdateContactDTOSchema), contact_controller_1.updateContact);
router.delete('/:id', contact_controller_1.deleteContact);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map