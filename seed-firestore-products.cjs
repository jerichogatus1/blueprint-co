const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function loadCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const resolved = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (fs.existsSync(resolved)) {
      return admin.credential.cert(JSON.parse(fs.readFileSync(resolved, 'utf8')));
    }
  }

  throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.');
}

admin.initializeApp({
  credential: loadCredential()
});

const db = admin.firestore();

const products = [
  {
    id: 'product-01-safety-helmet',
    code: '01',
    name: 'Safety Helmet (Hard Hat)',
    description: 'ABS High Impact Shell • Ventilated • Adjustable Fit',
    category: 'Core Safety Gear',
    price: 1200,
    stock: 0,
  },
  {
    id: 'product-02-safety-vest',
    code: '02',
    name: 'Safety Vest',
    description: 'High-Visibility • Reflective Strips • Lightweight',
    category: 'Core Safety Gear',
    price: 835,
    stock: 0,
  },
  {
    id: 'product-03-safety-gloves',
    code: '03',
    name: 'Safety Gloves',
    description: 'Durable Grip • Industrial Use • Comfortable Fit',
    category: 'Core Safety Gear',
    price: 615,
    stock: 0,
  },
  {
    id: 'product-05-safety-goggles',
    code: '05',
    name: 'Safety Goggles',
    description: 'Anti-Fog Lens • UV Protection • Clear/Navy Frame',
    category: 'Core Safety Gear',
    price: 730,
    stock: 0,
  },
  {
    id: 'product-06-ear-protection',
    code: '06',
    name: 'Ear Protection (Earmuffs)',
    description: 'Noise Reduction • Adjustable Headband • Padded Comfort',
    category: 'Core Safety Gear',
    price: 1035,
    stock: 0,
  },
  {
    id: 'product-07-toolbox-kit',
    code: '07',
    name: 'Toolbox Kit',
    description: 'Hard Case • Organized Compartments • Durable Build',
    category: 'Tools & Equipment',
    price: 3220,
    stock: 0,
  },
  {
    id: 'product-08-measuring-tape',
    code: '08',
    name: 'Measuring Tape',
    description: 'Steel Blade • Blueprint Grid Markings • Compact Design',
    category: 'Tools & Equipment',
    price: 670,
    stock: 0,
  },
  {
    id: 'product-09-safety-signage',
    code: '09',
    name: 'Safety Signage',
    description: 'Clean Typography • Blueprint Grid Style • High Visibility',
    category: 'Worksite Essentials',
    price: 730,
    stock: 0,
    notes: 'Size dependent pricing',
  },
  {
    id: 'product-10-full-ppe-kit',
    code: '10',
    name: 'Full PPE Kit Package',
    description: 'Includes Helmet • Vest • Gloves • Goggles • Ear Protection',
    category: 'Bundle Package',
    price: 4480,
    stock: 0,
  }
];

async function seedProducts() {
  try {
    await Promise.all(
      products.map(async ({ id, ...payload }) => {
        await db.collection('products').doc(id).set(payload);
        console.log(`Saved ${id}`);
      })
    );

    console.log('All products seeded to Firestore.');
  } catch (error) {
    console.error('Failed to seed products:', error);
    process.exit(1);
  }
}

seedProducts();
