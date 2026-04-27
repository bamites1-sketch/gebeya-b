const { PrismaClient } = require('@prisma/client');

// Single shared instance — prevents "too many connections" on free DB tiers
const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;
