import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial tenant and user context...');

    // 1. Ensure a default tenant exists
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: 'Mock Workspace',
                domain: 'mockcompany.com'
            }
        });
    }

    // 2. Ensure a default user exists to own contacts and organize meetings
    let user = await prisma.user.findUnique({ where: { firebaseUid: 'mock-uid-123' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                firebaseUid: 'mock-uid-123',
                email: 'mock@example.com',
                name: 'Mock User (Demo)',
                tenantId: tenant.id
            }
        });
    }

    console.log('Inserting 1000 Contacts...');
    // We can't do createMany if we want realistic associated data, but for contacts it's a flat table mostly
    const contactData = Array.from({ length: 1000 }).map(() => ({
        tenantId: tenant.id,
        ownerId: user.id,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company: faker.company.name(),
        jobTitle: faker.person.jobTitle()
    }));

    // Split into chunks to avoid Prisma query limits or memory crashes
    const chunkSize = 250;
    for (let i = 0; i < contactData.length; i += chunkSize) {
        const chunk = contactData.slice(i, i + chunkSize);
        await prisma.contact.createMany({ data: chunk });
        console.log(`Inserted ${i + chunkSize} / 1000 contacts...`);
    }
    console.log('\nContacts created.');

    console.log('Inserting 1000 Meetings...');
    const meetingData = Array.from({ length: 1000 }).map(() => ({
        tenantId: tenant.id,
        organizerId: user.id,
        title: `${faker.hacker.verb()} ${faker.hacker.noun()} sync`,
        description: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['ONLINE', 'IN_PERSON']) as any,
        date: faker.date.future({ years: 1 }),
        agenda: faker.lorem.paragraphs(2)
    }));

    for (let i = 0; i < meetingData.length; i += chunkSize) {
        const chunk = meetingData.slice(i, i + chunkSize);
        await prisma.meeting.createMany({ data: chunk });
        console.log(`Inserted ${i + chunkSize} / 1000 meetings...`);
    }
    console.log('\nMeetings created.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
    });
