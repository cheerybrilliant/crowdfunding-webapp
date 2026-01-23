import { config } from './config';
import app from './app';
import prisma from './prisma.service';

const startServer = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Check your backend/.env file.');
    }

    if (config.NODE_ENV === 'production' && config.JWT_SECRET.startsWith('your_')) {
      throw new Error('JWT_SECRET must be set to a strong value in production.');
    }

    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected successfully');

    // Start server
    app.listen(config.PORT, () => {
      console.log(`✓ Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      console.log(`  API: http://localhost:${config.PORT}/api`);
      console.log(`  Health: http://localhost:${config.PORT}/api/health`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
