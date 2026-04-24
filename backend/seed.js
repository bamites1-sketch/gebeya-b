const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Helper to generate Unsplash image URLs
function getImageUrl(keyword) {
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}`;
}

// Ethiopian product dataset with auto-loaded images
const PRODUCTS = [
  {
    name: 'Habesha Kemis',
    description: 'A traditional Ethiopian dress made from handwoven cotton and decorated with tibeb embroidery, worn during holidays and celebrations.',
    price: 3500,
    category: 'clothing',
    region: 'amhara',
    stock: 25,
    imageSearchKeywords: ['Habesha kemis white tibeb embroidery', 'Ethiopian traditional dress habesha kemis'],
  },
  {
    name: 'Netela Shawl',
    description: 'A lightweight white cotton shawl worn by Ethiopian women during religious and cultural occasions.',
    price: 800,
    category: 'clothing',
    region: 'amhara',
    stock: 60,
    imageSearchKeywords: ['Ethiopian netela white shawl traditional', 'Habesha netela tibeb design'],
  },
  {
    name: 'Oromo Cultural Dress',
    description: 'A colorful traditional dress representing Oromo identity, often worn during Irreecha and cultural festivals.',
    price: 2800,
    category: 'clothing',
    region: 'oromia',
    stock: 15,
    imageSearchKeywords: ['Oromo traditional dress colorful Ethiopia', 'Irreecha Oromo cultural clothing'],
  },
  {
    name: 'Mesob Basket',
    description: 'A beautifully handwoven basket used for serving injera and traditional meals in Ethiopian households.',
    price: 1200,
    category: 'crafts',
    region: 'amhara',
    stock: 18,
    imageSearchKeywords: ['Ethiopian mesob basket handmade colorful', 'injera basket mesob Ethiopia'],
  },
  {
    name: 'Jebena Coffee Pot',
    description: 'A traditional clay coffee pot used in the Ethiopian coffee ceremony, symbolizing hospitality and community.',
    price: 900,
    category: 'food',
    region: 'oromia',
    stock: 35,
    imageSearchKeywords: ['Ethiopian jebena coffee ceremony clay pot', 'traditional coffee ceremony Ethiopia'],
  },
  {
    name: 'Traditional Ethiopian Cross',
    description: 'An intricately designed Ethiopian Orthodox cross representing faith, history, and artistic craftsmanship.',
    price: 1500,
    category: 'art',
    region: 'tigray',
    stock: 20,
    imageSearchKeywords: ['Ethiopian orthodox cross intricate design', 'traditional Ethiopian cross handmade'],
  },
  {
    name: 'Injera with Doro Wat',
    description: 'A traditional Ethiopian dish consisting of injera served with spicy chicken stew, commonly enjoyed during celebrations.',
    price: 300,
    category: 'food',
    region: 'amhara',
    stock: 60,
    imageSearchKeywords: ['Ethiopian injera doro wat traditional food', 'Ethiopian food platter injera'],
  },
  {
    name: 'Tej Honey Wine',
    description: 'A traditional Ethiopian alcoholic beverage made from fermented honey, often served in cultural celebrations.',
    price: 250,
    category: 'food',
    region: 'amhara',
    stock: 40,
    imageSearchKeywords: ['Ethiopian tej honey wine glass', 'traditional Ethiopian honey wine tej'],
  },
  {
    name: 'Handwoven Scarf',
    description: 'A soft handwoven scarf made from Ethiopian cotton, often decorated with traditional patterns.',
    price: 600,
    category: 'crafts',
    region: 'tigray',
    stock: 50,
    imageSearchKeywords: ['Ethiopian handwoven scarf cotton tibeb', 'traditional Ethiopian scarf handmade'],
  },
  // Additional products for variety
  {
    name: 'Gabi — Ethiopian Handwoven Shawl',
    description: 'A thick, warm cotton shawl traditionally worn by Ethiopian men and women. The Gabi is a symbol of Ethiopian identity — used as a blanket, prayer shawl, and formal wrap.',
    price: 1800,
    category: 'clothing',
    region: 'amhara',
    stock: 40,
    imageSearchKeywords: ['Ethiopian gabi shawl traditional', 'handwoven Ethiopian blanket'],
  },
  {
    name: 'Tilfi — Traditional Silver Necklace',
    description: 'A stunning silver necklace worn by Tigrayan and Amhara women during weddings and religious festivals. Features the traditional cross pendant surrounded by intricate filigree work.',
    price: 2800,
    category: 'jewelry',
    region: 'tigray',
    stock: 12,
    imageSearchKeywords: ['Ethiopian silver necklace traditional', 'Tilfi Ethiopian jewelry cross'],
  },
  {
    name: 'Oromo Beaded Necklace — Sinqee',
    description: 'Colorful beaded necklace representing Oromo women\'s cultural identity. The Sinqee is a sacred symbol of Oromo women\'s rights and dignity.',
    price: 1350,
    category: 'jewelry',
    region: 'oromia',
    stock: 28,
    imageSearchKeywords: ['Oromo beaded necklace colorful', 'Sinqee Ethiopian jewelry'],
    localImage: 'oromo-sinqee-necklace.jpg',
  },
  {
    name: 'Afar Leather Bracelet',
    description: 'Handcrafted leather bracelet from the Afar people, decorated with traditional geometric stamps and natural dyes.',
    price: 420,
    category: 'accessories',
    region: 'afar',
    stock: 45,
    imageSearchKeywords: ['Afar leather bracelet handmade', 'Ethiopian leather jewelry traditional'],
  },
  {
    name: 'Harar Basket Bag',
    description: 'A colorful woven shoulder bag from Harar — the walled city famous for its basket weaving tradition. Made from natural fibers dyed with plant-based colors.',
    price: 780,
    category: 'accessories',
    region: 'harari',
    stock: 33,
    imageSearchKeywords: ['Harar basket bag woven colorful', 'Ethiopian basket shoulder bag'],
  },
  {
    name: 'Ethiopian Orthodox Icon — Saint George',
    description: 'A traditional Ethiopian Orthodox painting of Saint George (Kidus Giorgis) — the patron saint of Ethiopia. Painted on goat skin using natural pigments.',
    price: 3200,
    category: 'art',
    region: 'amhara',
    stock: 8,
    imageSearchKeywords: ['Ethiopian orthodox icon painting', 'Saint George Ethiopian art'],
  },
  {
    name: 'Lalibela Cross — Hand-Carved',
    description: 'A replica of the famous Lalibela processional cross, hand-carved from olive wood. The intricate geometric patterns represent the 12 apostles.',
    price: 1500,
    category: 'art',
    region: 'amhara',
    stock: 22,
    imageSearchKeywords: ['Lalibela cross wooden carved', 'Ethiopian cross handmade olive wood'],
  },
  {
    name: 'Ethiopian Coffee — Yirgacheffe',
    description: 'Premium single-origin coffee from Yirgacheffe, Sidama — the birthplace of coffee. Light roasted to preserve the natural floral and citrus notes.',
    price: 580,
    category: 'food',
    region: 'snnpr',
    stock: 100,
    imageSearchKeywords: ['Yirgacheffe Ethiopian coffee beans', 'Ethiopian coffee single origin'],
  },
  {
    name: 'Berbere Spice Blend',
    description: 'The soul of Ethiopian cuisine — a complex blend of chili peppers, fenugreek, coriander, korarima (Ethiopian cardamom), rue, ajwain, and sacred basil.',
    price: 320,
    category: 'food',
    region: 'amhara',
    stock: 80,
    imageSearchKeywords: ['Berbere Ethiopian spice blend red', 'Ethiopian spices traditional'],
  },
  {
    name: 'Krar — Ethiopian Five-String Lyre',
    description: 'The Krar is a five or six-string bowl lyre — one of Ethiopia\'s most beloved traditional instruments. Played by azmaris (wandering minstrels) and modern musicians alike.',
    price: 4500,
    category: 'music',
    region: 'amhara',
    stock: 10,
    imageSearchKeywords: ['Krar Ethiopian lyre instrument', 'Ethiopian traditional music instrument'],
  },
  {
    name: 'Masenqo — Single-String Fiddle',
    description: 'The Masenqo is a single-string bowed lute played with a horsehair bow. It is the instrument of the azmari — Ethiopia\'s traditional poet-musicians.',
    price: 3800,
    category: 'music',
    region: 'amhara',
    stock: 8,
    imageSearchKeywords: ['Masenqo Ethiopian fiddle instrument', 'Ethiopian traditional string instrument'],
  },
  {
    name: 'Kebero — Ceremonial Drum',
    description: 'The Kebero is a double-headed conical drum used in Ethiopian Orthodox church services and cultural celebrations. Produces a deep resonant sound.',
    price: 2600,
    category: 'music',
    region: 'amhara',
    stock: 12,
    imageSearchKeywords: ['Kebero Ethiopian drum traditional', 'Ethiopian ceremonial drum'],
  },
  {
    name: 'Washint — Bamboo Flute',
    description: 'The Washint is a simple bamboo end-blown flute producing a hauntingly beautiful sound. Traditionally played by shepherds in the Ethiopian highlands.',
    price: 850,
    category: 'music',
    region: 'amhara',
    stock: 25,
    imageSearchKeywords: ['Washint Ethiopian bamboo flute', 'Ethiopian traditional flute instrument'],
  },
  {
    name: 'Begena — Harp of King David',
    description: 'The Begena is a large ten-string lyre known as the "Harp of King David." Used exclusively for meditation and religious music. A rare and sacred instrument.',
    price: 8500,
    category: 'music',
    region: 'amhara',
    stock: 5,
    imageSearchKeywords: ['Begena Ethiopian harp instrument', 'Ethiopian traditional lyre King David'],
  },
  {
    name: 'Pottery Bowl Set — Dorze Style',
    description: 'Hand-thrown clay bowls from the Dorze people of southern Ethiopia, decorated with traditional geometric patterns. Each set is unique.',
    price: 890,
    category: 'crafts',
    region: 'snnpr',
    stock: 30,
    imageSearchKeywords: ['Dorze Ethiopian pottery bowls', 'Ethiopian traditional clay pottery'],
  },
  {
    name: 'Injera Basket — Geja Genet',
    description: 'A beautifully woven flat basket used to serve injera (Ethiopian flatbread). The colorful geometric patterns represent different regional traditions.',
    price: 480,
    category: 'crafts',
    region: 'harari',
    stock: 50,
    imageSearchKeywords: ['Ethiopian injera basket woven', 'Geja Genet basket colorful'],
    localImage: 'injera-basket-geja-genet.jpg',
  },
];

async function seed() {
  console.log('🌱 Seeding Gebeya-B with authentic Ethiopian products...\n');

  // ── Admin user ──────────────────────────────────────────────────
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
    console.log('✅ Admin created: admin@gebeya-b.com / admin1234');
  } else {
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });
    console.log('✅ Admin already exists — role confirmed ADMIN');
  }

  // ── Demo user ───────────────────────────────────────────────────
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
    console.log('✅ Demo user created: demo@gebeya-b.com / demo1234');
  } else {
    console.log('✅ Demo user already exists');
  }

  // ── Clear existing product data ─────────────────────────────────
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  console.log('\n🗑️  Cleared existing product data\n');

  // ── Insert products with auto-loaded images ─────────────────────
  console.log('📸 Auto-loading images from Unsplash...\n');
  for (const p of PRODUCTS) {
    const images = p.localImage
      ? [p.localImage]
      : [
          getImageUrl(p.imageSearchKeywords[0]),
          getImageUrl(p.imageSearchKeywords[1] || p.imageSearchKeywords[0]),
        ];

    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        region: p.region,
        stock: p.stock,
        images: JSON.stringify(images),
      },
    });
    console.log(`  ✔ ${p.name}`);
  }

  // ── Summary ─────────────────────────────────────────────────────
  console.log(`\n✅ Seeded ${PRODUCTS.length} authentic Ethiopian products\n`);
  console.log('📋 Breakdown by category:');
  const counts = await prisma.product.groupBy({ by: ['category'], _count: true });
  counts.forEach((c) => console.log(`   ${c.category.padEnd(14)} ${c._count} products`));

  console.log('\n📋 Breakdown by region:');
  const regions = await prisma.product.groupBy({ by: ['region'], _count: true });
  regions.forEach((r) => console.log(`   ${(r.region || 'n/a').padEnd(14)} ${r._count} products`));

  console.log('\n🚀 Ready! Run the app and log in with:');
  console.log('   Admin : admin@gebeya-b.com / admin1234');
  console.log('   Demo  : demo@gebeya-b.com  / demo1234');
}

seed()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
