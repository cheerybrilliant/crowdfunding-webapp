import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// import {  registerUser } from './auth.service'; // Adjust path if needed

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  // If registerUser returns { user, token }, you may need a separate hashPassword function.
  // Example using bcrypt:
   

  const adminPassword = await bcrypt.hash('CancerCare2026', 10);
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
  
  
  