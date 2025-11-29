const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['query'] });

(async () => {
  try {
    const applicants = await prisma.applicant.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    console.log('APPLICANTS:', JSON.stringify(applicants, null, 2));

    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    console.log('NOTIFICATIONS:', JSON.stringify(notifications, null, 2));

  } catch (err) {
    console.error('Error querying database:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
