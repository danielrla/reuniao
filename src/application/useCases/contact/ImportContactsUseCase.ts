import prisma from '../../../config/prisma';
import { CreateContactDTOSchema, CreateContactDTO } from '../../dtos/ContactDTOs';

export class ImportContactsUseCase {
    async execute(tenantId: string, ownerId: string, contactsData: any[]): Promise<{ successCount: number, errorCount: number, errors: any[] }> {
        let successCount = 0;
        let errorCount = 0;
        const errors: any[] = [];

        for (const [index, row] of contactsData.entries()) {
            try {
                // Remove empty strings to let Zod handle optionals properly
                const cleanedRow = Object.fromEntries(
                    Object.entries(row).map(([k, v]) => [k, v === '' ? undefined : v])
                );

                // Run Zod validation
                const validatedData = CreateContactDTOSchema.parse(cleanedRow);

                // Insert into db
                await prisma.contact.create({
                    data: {
                        ...validatedData,
                        tenantId,
                        ownerId
                    }
                });

                successCount++;
            } catch (err: any) {
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
