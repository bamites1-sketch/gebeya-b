const { PrismaClient } = require('@prisma/client');

// Force connection_limit=1 for free-tier DBs (Clever Cloud allows only 5 total).
// Append it to the URL if not already present so it works regardless of how
// DATABASE_URL is set in the Render dashboard.
function buildUrl() {
  const url = process.env.DATABASE_URL || '';
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('connection_limit')) {
      u.searchParams.set('connection_limit', '1');
    }
    if (!u.searchParams.has('pool_timeout')) {
      u.searchParams.set('pool_timeout', '10');
    }
    return u.toString();
  } catch {
    return url;
  }
}

// Single shared instance — prevents connection exhaustion on free DB tiers
const prisma = global.prisma || new PrismaClient({
  datasources: { db: { url: buildUrl() } },
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;
