import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando limpeza de contatos inválidos...');

    const result = await prisma.contact.deleteMany({
        where: {
            OR: [
                { email: null },
                { phone: null },
                { email: '' },
                { phone: '' },
            ]
        }
    });

    console.log(`Limpeza concluída. ${result.count} contatos inválidos foram removidos.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
