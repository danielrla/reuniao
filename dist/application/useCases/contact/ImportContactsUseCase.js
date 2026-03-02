"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportContactsUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const ContactDTOs_1 = require("../../dtos/ContactDTOs");
class ImportContactsUseCase {
    async execute(tenantId, ownerId, contactsData) {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        for (const [index, row] of contactsData.entries()) {
            try {
                // Remove empty strings to let Zod handle optionals properly
                const cleanedRow = Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v === '' ? undefined : v]));
                // Run Zod validation
                const validatedData = ContactDTOs_1.CreateContactDTOSchema.parse(cleanedRow);
                // Insert into db
                await prisma_1.default.contact.create({
                    data: {
                        ...validatedData,
                        tenantId,
                        ownerId
                    }
                });
                successCount++;
            }
            catch (err) {
                errorCount++;
                errors.push({
                    row: index + 1, // 1-indexed for user readability
                    data: row,
                    issues: err.errors || err.message
                });
            }
        }
        return { successCount, errorCount, errors };
    }
}
exports.ImportContactsUseCase = ImportContactsUseCase;
//# sourceMappingURL=ImportContactsUseCase.js.map