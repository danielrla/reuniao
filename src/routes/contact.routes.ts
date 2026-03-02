import { Router } from 'express';
import { getContacts, createContact, updateContact, deleteContact, importContacts, syncGoogleContacts } from '../controllers/contact.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../interface/middlewares/validateRequest';
import { CreateContactDTOSchema, UpdateContactDTOSchema } from '../application/dtos/ContactDTOs';

const router = Router();

// Protect all contact routes
router.use(requireAuth);

router.get('/', getContacts);
router.post('/import', importContacts);
router.post('/sync-google', syncGoogleContacts);
router.post('/', validateRequest(CreateContactDTOSchema), createContact);
router.put('/:id', validateRequest(UpdateContactDTOSchema), updateContact);
router.delete('/:id', deleteContact);

export default router;
