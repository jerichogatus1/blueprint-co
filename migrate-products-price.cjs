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

async function migrateProducts() {
  const snapshot = await db.collection('products').get();

  if (snapshot.empty) {
    console.log('No products found.');
    return;
  }

  const batchSize = 400;
  let batch = db.batch();
  let count = 0;
  let writes = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const price =
      typeof data.price === 'number'
        ? data.price
        : Math.round(Number(data.priceMin ?? data.priceMax ?? 0));

    batch.update(docSnap.ref, {
      price,
      priceMin: admin.firestore.FieldValue.delete(),
      priceMax: admin.firestore.FieldValue.delete()
    });
    count += 1;
    writes += 1;

    if (count >= batchSize) {
      await batch.commit();
      console.log(`Committed ${writes} product updates`);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Committed ${writes} product updates`);
  }

  console.log('Product price migration complete.');
}

migrateProducts().catch((error) => {
  console.error('Failed to migrate product prices:', error);
  process.exit(1);
});
