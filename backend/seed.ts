import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service'; // Adjust path if needed

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminPassword = await AuthService.hashPassword('CancerCare2026');
  await prisma.user.upsert({
    where: { email: 'admin@cancercare.com' },
    update: {},
    create: {
      fullName: 'Admin',
      email: 'admin@cancercare.com',
      phone: '+237000000000',
      passwordHash: adminPassword,
      accountType: 'donor', // or add 'admin' type
      verified: true,
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  
  
  