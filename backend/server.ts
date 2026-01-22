import { config } from './config';
import app from './app';
import prisma from './prisma.service';

const startServer = async () => {
  try {
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