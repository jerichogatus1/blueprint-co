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

async function deleteCollection(collectionPath) {
  const snapshot = await db.collection(collectionPath).get();

  if (snapshot.empty) {
    console.log(`No documents found in ${collectionPath}.`);
    return;
  }

  const batchSize = 400;
  let batch = db.batch();
  let count = 0;
  let deleted = 0;

  for (const docSnap of snapshot.docs) {
    batch.delete(docSnap.ref);
    count += 1;
    deleted += 1;

    if (count >= batchSize) {
      await batch.commit();
      console.log(`Deleted ${deleted} docs from ${collectionPath}`);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Deleted ${deleted} docs from ${collectionPath}`);
  }

  console.log(`Collection cleanup complete for ${collectionPath}.`);
}

deleteCollection('quotes').catch((error) => {
  console.error('Failed to delete quotes collection docs:', error);
  process.exit(1);
});
