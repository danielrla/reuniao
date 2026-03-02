import prisma from './src/config/prisma';

async function seed() {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('No user found');

    for (let i = 1; i <= 25; i++) {
        await prisma.contact.create({
            data: {
                ownerId: user.id,
                tenantId: user.tenantId,
                name: `Test Contact ${i}`,
                email: `test${i}@example.com`
            }
        });
    }
    console.log('25 contacts seeded.');
}
seed().catch(console.error);
