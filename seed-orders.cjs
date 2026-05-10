const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

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
  credential: loadCredential(),
});

const db = admin.firestore();

async function seedOrders() {
  const orders = [
    {
      items: [
        { id: 'safety-helmet', name: 'Safety Helmet', price: 25, quantity: 2 },
        { id: 'safety-vest', name: 'Safety Vest', price: 15, quantity: 1 }
      ],
      totalPrice: 65,
      status: 'pending',
      paymentMethod: 'gcash',
      customerEmail: 'customer@example.com',
      customerName: 'Test Customer',
      createdAt: admin.firestore.Timestamp.now(),
    },
    {
      items: [
        { id: 'hard-hat', name: 'Hard Hat', price: 30, quantity: 3 }
      ],
      totalPrice: 90,
      status: 'pending',
      paymentMethod: 'paypal',
      customerEmail: 'another@example.com',
      customerName: 'Another Customer',
      createdAt: admin.firestore.Timestamp.now(),
    },
  ];

  for (const order of orders) {
    try {
      await db.collection('orders').add(order);
      console.log('Added order for:', order.customerName);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  }

  console.log('Orders seeded successfully!');
  process.exit();
}

seedOrders();
