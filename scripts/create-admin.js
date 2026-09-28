// usage: DATABASE_URL=... node scripts/create-admin.js admin@noorcreations.com 'password'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const [email, pw] = process.argv.slice(2);
  if (!email || !pw) return console.log('usage: node scripts/create-admin.js <email> <password>');
  const p = new PrismaClient();
  const passwordHash = await bcrypt.hash(pw, 12);
  await p.admin.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  console.log('Admin ready:', email);
  await p.$disconnect();
})();
