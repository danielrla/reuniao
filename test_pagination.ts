import prisma from './src/config/prisma';

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('No user');

  const page1 = await prisma.contact.findMany({ skip: 0, take: 20 });
  const page2 = await prisma.contact.findMany({ skip: 20, take: 20 });

  console.log('Page 1 items:', page1.length);
  console.log('Page 2 items:', page2.length);
}
test().catch(console.error);
