/**
 * seed-auto.js — Non-destructive seed that runs on server startup
 * when the products table is empty.
 * 
 * Unlike seed.js (dev tool), this NEVER deletes existing users, orders,
 * or cart data. It only inserts what's missing.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const UNSPLASH_IMAGES = {
  clothing:  'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80',
  clothing2: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
  crafts:    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  crafts2:   'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
  coffee:    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  coffee2:   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  food:      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  jewelry:   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  jewelry2:  'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=80',
  music:     'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
  music2:    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
  art:       'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&q=80',
};

const getImages = (category) => JSON.stringify([
  UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES.crafts,
  UNSPLASH_IMAGES[category + '2'] || UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES.crafts,
]);

const PRODUCTS = [
  { name: 'Habesha Kemis', description: 'A traditional Ethiopian dress made from handwoven cotton and decorated with tibeb embroidery, worn during holidays and celebrations.', price: 3500, category: 'clothing', region: 'amhara', stock: 25 },
  { name: 'Netela Shawl', description: 'A lightweight white cotton shawl worn by Ethiopian women during religious and cultural occasions.', price: 800, category: 'clothing', region: 'amhara', stock: 60 },
  { name: 'Oromo Cultural Dress', description: 'A colorful traditional dress representing Oromo identity, often worn during Irreecha and cultural festivals.', price: 2800, category: 'clothing', region: 'oromia', stock: 15 },
  { name: 'Gabi — Ethiopian Handwoven Shawl', description: 'A thick, warm cotton shawl traditionally worn by Ethiopian men and women. Symbol of Ethiopian identity.', price: 1800, category: 'clothing', region: 'amhara', stock: 40 },
  { name: 'Mesob Basket', description: 'A beautifully handwoven basket used for serving injera and traditional meals in Ethiopian households.', price: 1200, category: 'crafts', region: 'amhara', stock: 18 },
  { name: 'Handwoven Scarf', description: 'A soft handwoven scarf made from Ethiopian cotton, often decorated with traditional patterns.', price: 600, category: 'crafts', region: 'tigray', stock: 50 },
  { name: 'Pottery Bowl Set — Dorze Style', description: 'Hand-thrown clay bowls from the Dorze people of southern Ethiopia, decorated with traditional geometric patterns.', price: 890, category: 'crafts', region: 'snnpr', stock: 30 },
  { name: 'Injera Basket — Geja Genet', description: 'A beautifully woven flat basket used to serve injera. Colorful geometric patterns represent different regional traditions.', price: 480, category: 'crafts', region: 'harari', stock: 50 },
  { name: 'Tilfi — Traditional Silver Necklace', description: 'A stunning silver necklace worn by Tigrayan and Amhara women during weddings and religious festivals.', price: 2800, category: 'jewelry', region: 'tigray', stock: 12 },
  { name: 'Oromo Beaded Necklace — Sinqee', description: "Colorful beaded necklace representing Oromo women's cultural identity and dignity.", price: 1350, category: 'jewelry', region: 'oromia', stock: 28 },
  { name: 'Afar Leather Bracelet', description: 'Handcrafted leather bracelet from the Afar people, decorated with traditional geometric stamps and natural dyes.', price: 420, category: 'accessories', region: 'afar', stock: 45 },
  { name: 'Harar Basket Bag', description: 'A colorful woven shoulder bag from Harar — the walled city famous for its basket weaving tradition.', price: 780, category: 'accessories', region: 'harari', stock: 33 },
  { name: 'Traditional Ethiopian Cross', description: 'An intricately designed Ethiopian Orthodox cross representing faith, history, and artistic craftsmanship.', price: 1500, category: 'art', region: 'tigray', stock: 20 },
  { name: 'Ethiopian Orthodox Icon — Saint George', description: 'A traditional Ethiopian Orthodox painting of Saint George — the patron saint of Ethiopia. Painted on goat skin.', price: 3200, category: 'art', region: 'amhara', stock: 8 },
  { name: 'Lalibela Cross — Hand-Carved', description: 'A replica of the famous Lalibela processional cross, hand-carved from olive wood.', price: 1500, category: 'art', region: 'amhara', stock: 22 },
  { name: 'Jebena Coffee Pot', description: 'A traditional clay coffee pot used in the Ethiopian coffee ceremony, symbolizing hospitality and community.', price: 900, category: 'food', region: 'oromia', stock: 35 },
  { name: 'Ethiopian Coffee — Yirgacheffe', description: 'Premium single-origin coffee from Yirgacheffe, Sidama — the birthplace of coffee. Light roasted to preserve floral and citrus notes.', price: 580, category: 'food', region: 'snnpr', stock: 100 },
  { name: 'Berbere Spice Blend', description: 'The soul of Ethiopian cuisine — a complex blend of chili peppers, fenugreek, coriander, korarima, rue, ajwain, and sacred basil.', price: 320, category: 'food', region: 'amhara', stock: 80 },
  { name: 'Injera with Doro Wat', description: 'A traditional Ethiopian dish consisting of injera served with spicy chicken stew, enjoyed during celebrations.', price: 300, category: 'food', region: 'amhara', stock: 60 },
  { name: 'Krar — Ethiopian Five-String Lyre', description: "The Krar is a five-string bowl lyre — one of Ethiopia's most beloved traditional instruments.", price: 4500, category: 'music', region: 'amhara', stock: 10 },
  { name: 'Masenqo — Single-String Fiddle', description: 'The Masenqo is a single-string bowed lute played with a horsehair bow. The instrument of the azmari.', price: 3800, category: 'music', region: 'amhara', stock: 8 },
  { name: 'Kebero — Ceremonial Drum', description: 'The Kebero is a double-headed conical drum used in Ethiopian Orthodox church services and cultural celebrations.', price: 2600, category: 'music', region: 'amhara', stock: 12 },
  { name: 'Washint — Bamboo Flute', description: 'The Washint is a bamboo end-blown flute producing a hauntingly beautiful sound. Traditionally played by highland shepherds.', price: 850, category: 'music', region: 'amhara', stock: 25 },
  { name: 'Begena — Harp of King David', description: 'The Begena is a large ten-string lyre known as the "Harp of King David." Used for meditation and religious music.', price: 8500, category: 'music', region: 'amhara', stock: 5 },
];

const DEFAULT_PAYMENT_CONFIG = [
  { key: 'payment_cbe_account',      value: '1000524532771' },
  { key: 'payment_cbe_name',         value: 'Beamlak Tesfahun' },
  { key: 'payment_telebirr_account', value: '0975731806' },
  { key: 'payment_telebirr_name',    value: 'Beamlak Tesfahun' },
  { key: 'payment_boa_account',      value: '' },
  { key: 'payment_boa_name',         value: '' },
  { key: 'payment_awash_account',    value: '' },
  { key: 'payment_awash_name',       value: '' },
];

async function autoSeed() {
  console.log('🌱 Auto-seeding Ethiopian products...');

  // ── Ensure admin user exists ──────────────────────────────────
  const adminEmail = 'admin@gebeya-b.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Gebeya Admin',
        email: adminEmail,
        password: await bcrypt.hash('admin1234', 12),
        role: 'ADMIN',
      },
    });
    await prisma.cart.create({ data: { userId: admin.id } });
    await prisma.wishlist.create({ data: { userId: admin.id } });
    console.log('  ✔ Admin user created: admin@gebeya-b.com / admin1234');
  } else {
    // Ensure role is ADMIN
    if (admin.role !== 'ADMIN') {
      await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });
    }
    // Ensure cart/wishlist exist
    const hasCart = await prisma.cart.findUnique({ where: { userId: admin.id } });
    if (!hasCart) await prisma.cart.create({ data: { userId: admin.id } });
    const hasWishlist = await prisma.wishlist.findUnique({ where: { userId: admin.id } });
    if (!hasWishlist) await prisma.wishlist.create({ data: { userId: admin.id } });
    console.log('  ✔ Admin user already exists');
  }

  // ── Ensure demo user exists ───────────────────────────────────
  const demoEmail = 'demo@gebeya-b.com';
  let demo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!demo) {
    demo = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: demoEmail,
        password: await bcrypt.hash('demo1234', 12),
        role: 'USER',
      },
    });
    await prisma.cart.create({ data: { userId: demo.id } });
    await prisma.wishlist.create({ data: { userId: demo.id } });
    console.log('  ✔ Demo user created');
  }

  // ── Insert products ───────────────────────────────────────────
  let inserted = 0;
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        region: p.region,
        stock: p.stock,
        images: getImages(p.category),
      },
    });
    inserted++;
  }
  console.log(`  ✔ ${inserted} products seeded`);

  // ── Seed default payment config if missing ────────────────────
  for (const { key, value } of DEFAULT_PAYMENT_CONFIG) {
    await prisma.siteConfig.upsert({
      where: { key },
      update: {},          // don't overwrite existing values
      create: { key, value },
    });
  }
  console.log('  ✔ Payment config defaults ensured');
  console.log('✅ Auto-seed complete');
}

autoSeed()
  .catch((e) => console.error('❌ Auto-seed failed:', e.message))
  .finally(() => prisma.$disconnect());
