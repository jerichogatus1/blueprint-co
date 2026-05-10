import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Administrator';
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

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

  return admin.credential.applicationDefault();
}

async function main() {
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.');
  }

  if (serviceAccountPath && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(path.resolve(serviceAccountPath))) {
    throw new Error(`Service account file not found: ${serviceAccountPath}`);
  }

  admin.initializeApp({ credential: loadCredential() });

  const auth = admin.auth();
  const db = admin.firestore();

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }

    userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });
  }

  await auth.setCustomUserClaims(userRecord.uid, { admin: true });

  await db.collection('users').doc(userRecord.uid).set({
    name,
    email,
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  console.log(`Admin user ready: ${email}`);
  console.log('Custom claim: admin=true');
}

main().catch((error) => {
  console.error('Admin bootstrap failed:', error.message);
  process.exit(1);
});
