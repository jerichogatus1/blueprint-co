import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

function loadCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  if (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) {
    const raw = fs.readFileSync(path.resolve(serviceAccountPath), 'utf8');
    return admin.credential.cert(JSON.parse(raw));
  }

  return admin.credential.applicationDefault();
}

admin.initializeApp({ credential: loadCredential() });
const db = admin.firestore();

const products = [
  {
    id: 'product-01-safety-helmet',
    code: '01',
    name: 'Safety Helmet (Hard Hat)',
    description: 'Premium ABS high impact shell with excellent ventilation for comfort during long work hours. Features adjustable fit system with 6-point suspension harness. ANSI/ISEA Z89.1 certified for Type 1 Class C protection. Includes sweat-wicking padding and reflective strips for enhanced visibility.',
    category: 'Core Safety Gear',
    price: 1200,
    stock: 0,
    imageUrl: '/images/products/Safety Helmet (Hard Hat).png',
  },
  {
    id: 'product-02-safety-vest',
    code: '02',
    name: 'Safety Vest',
    description: 'High-visibility safety vest made from durable polyester mesh material. Features 2-inch wide reflective tape strips for maximum visibility in low-light conditions. Available in bright orange and yellow colors. Lightweight and breathable design with multiple pockets for tools and accessories.',
    category: 'Core Safety Gear',
    price: 835,
    stock: 0,
    imageUrl: '/images/products/Safety Vest.png',
  },
  {
    id: 'product-03-safety-gloves',
    code: '03',
    name: 'Safety Gloves',
    description: 'Professional-grade safety gloves designed for industrial use. Made from high-quality synthetic leather with reinforced palm and fingers for superior grip and protection. Features elastic cuff for secure fit and breathable back for comfort. Ideal for construction, manufacturing, and heavy-duty tasks.',
    category: 'Core Safety Gear',
    price: 615,
    stock: 0,
    imageUrl: '/images/products/Safety Gloves.png',
  },
  {
    id: 'product-04-safety-boots',
    code: '04',
    name: 'Safety Boots',
    description: 'Heavy-duty safety boots with steel toe cap protection and puncture-resistant sole. Features waterproof leather upper with breathable mesh panels for all-day comfort. Anti-slip outsole provides excellent traction on wet or oily surfaces. Meets ASTM F2413 safety standards with electrical hazard protection.',
    category: 'Core Safety Gear',
    price: 3000,
    stock: 0,
    imageUrl: '/images/products/Safety Boots.png',
  },
  {
    id: 'product-05-safety-goggles',
    code: '05',
    name: 'Safety Goggles',
    description: 'Anti-fog safety goggles with UV protection and clear polycarbonate lens. Features adjustable elastic headband for secure fit and soft foam padding for comfort. Indirect ventilation system prevents fogging during extended wear. Available in clear and tinted lens options for different working environments.',
    category: 'Core Safety Gear',
    price: 730,
    stock: 0,
    imageUrl: '/images/products/Safety Goggles.png',
  },
  {
    id: 'product-06-ear-protection',
    code: '06',
    name: 'Ear Protection (Earmuffs)',
    description: 'Noise reduction earmuffs with NRR 29dB rating for effective hearing protection. Features adjustable headband with padded cushions for all-day comfort. Lightweight design with foldable construction for easy storage. Ideal for construction sites, manufacturing facilities, and other high-noise environments.',
    category: 'Core Safety Gear',
    price: 1035,
    stock: 0,
    imageUrl: '/images/products/Ear Protection (Earmuffs).png',
  },
  {
    id: 'product-07-toolbox-kit',
    code: '07',
    name: 'Toolbox Kit',
    description: 'Comprehensive toolbox kit containing essential hand tools for construction and maintenance work. Includes hammer, screwdrivers, pliers, wrenches, tape measure, and utility knife. Organized in a durable plastic toolbox with removable trays. Perfect starter kit for apprentices and professionals alike.',
    category: 'Tools & Equipment',
    price: 3220,
    stock: 0,
    imageUrl: '/images/products/Toolbox Kit.png',
  },
  {
    id: 'product-08-measuring-tape',
    code: '08',
    name: 'Measuring Tape',
    description: 'Professional-grade measuring tape with 25-foot steel blade and blueprint grid markings. Features lock button for precise measurements and belt clip for convenience. Durable ABS plastic case with rubber grip. Accurate to within 1/16 inch for reliable construction and carpentry work.',
    category: 'Tools & Equipment',
    price: 670,
    stock: 0,
    imageUrl: '/images/products/Measuring Tape.png',
  },
  {
    id: 'product-09-safety-signage',
    code: '09',
    name: 'Safety Signage',
    description: 'Professional safety signage with clean typography and blueprint grid design. Available in various sizes and materials including aluminum, plastic, and magnetic options. High-visibility colors and clear messaging for effective workplace communication. Custom text and designs available upon request.',
    category: 'Worksite Essentials',
    price: 730,
    stock: 0,
    notes: 'Size dependent pricing',
    imageUrl: '/images/products/Safety Signage.png',
  },
  {
    id: 'product-10-full-ppe-kit',
    code: '10',
    name: 'Full PPE Kit Package',
    description: 'Complete personal protective equipment package including safety helmet, vest, gloves, goggles, and ear protection. Everything needed for comprehensive workplace safety in one convenient bundle. Save money compared to buying items individually. Perfect for new employees or safety training programs.',
    category: 'Bundle Package',
    price: 4480,
    stock: 0,
    imageUrl: '/images/products/Full PPE Kit Package.png',
  }
];

async function seedProducts() {
  try {
    const promises = products.map(async (product) => {
      const { id, ...payload } = product;
      await db.collection('products').doc(id).set(payload);
      console.log(`Saved ${product.name} as ${id}`);
    });

    await Promise.all(promises);
    console.log('✅ All products seeded to Firestore.');
  } catch (error) {
    console.error('❌ Failed to seed products:', error);
    process.exit(1);
  }
}

seedProducts();
