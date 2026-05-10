import admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

setGlobalOptions({ maxInstances: 10 });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

type CartItemInput = {
  id?: string;
  quantity?: number;
};

type CreateOrderInput = {
  items?: CartItemInput[];
  paymentMethod?: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
};

type UpdateOrderStatusInput = {
  id?: string;
  status?: string;
};

function isValidStatus(status: string | undefined): status is string {
  return ['pending', 'approved', 'rejected', 'shipped', 'delivered', 'cancelled'].includes(status || '');
}

export const createOrder = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to place an order.');
  }

  const { items, paymentMethod, shippingAddress } = (request.data || {}) as CreateOrderInput;

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError('invalid-argument', 'Cart is empty.');
  }

  const email = request.auth.token.email;
  const uid = request.auth.uid;
  if (!email) {
    throw new HttpsError('failed-precondition', 'Your account does not have an email address.');
  }

  const profileSnap = await db.collection('users').doc(request.auth.uid).get();
  const profileData = profileSnap.exists ? profileSnap.data() : null;
  const customerName = profileData?.name || request.auth.token.name || email;
  const address = shippingAddress || {};

  const normalizedAddress = {
    fullName: String(address.fullName || customerName).trim(),
    phone: String(address.phone || '').trim(),
    line1: String(address.line1 || '').trim(),
    line2: String(address.line2 || '').trim(),
    city: String(address.city || '').trim(),
    region: String(address.region || '').trim(),
    postalCode: String(address.postalCode || '').trim(),
    country: String(address.country || 'Philippines').trim()
  };

  if (
    !normalizedAddress.fullName ||
    !normalizedAddress.phone ||
    !normalizedAddress.line1 ||
    !normalizedAddress.city ||
    !normalizedAddress.region ||
    !normalizedAddress.postalCode ||
    !normalizedAddress.country
  ) {
    throw new HttpsError('invalid-argument', 'Shipping address is incomplete.');
  }

  const orderRef = db.collection('orders').doc();
  const orderItems: Array<{ id: string; name: string; price: number; quantity: number }> = [];
  let totalPrice = 0;

  await db.runTransaction(async (transaction) => {
    for (const rawItem of items) {
      const id = rawItem?.id?.trim();
      const quantity = Number(rawItem?.quantity ?? 0);

      if (!id || !Number.isInteger(quantity) || quantity <= 0) {
        throw new HttpsError('invalid-argument', 'Each cart item must include a valid id and quantity.');
      }

      const productRef = db.collection('products').doc(id);
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists) {
        throw new HttpsError('not-found', `Product not found: ${id}`);
      }

      const product = productSnap.data();
      const currentStock = Number(product?.stock ?? 0);

      if (currentStock < quantity) {
        throw new HttpsError('failed-precondition', `Insufficient stock for ${product?.name || id}.`);
      }

      const unitPrice = Number(product?.price ?? product?.priceMin ?? 0);
      totalPrice += unitPrice * quantity;

      transaction.update(productRef, {
        stock: currentStock - quantity
      });

      orderItems.push({
        id,
        name: product?.name || id,
        price: unitPrice,
        quantity
      });
    }

    transaction.set(orderRef, {
      items: orderItems,
      totalPrice,
      status: 'pending',
      paymentMethod: paymentMethod || 'gcash',
      shippingAddress: normalizedAddress,
      customerEmail: email,
      customerName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid
    });
  });

  return {
    orderId: orderRef.id,
    totalPrice
  };
});

export const updateOrderStatus = onCall({ region: 'asia-southeast1' }, async (request) => {
  if (!request.auth?.token?.admin) {
    throw new HttpsError('permission-denied', 'Admin access required.');
  }

  const { id, status } = (request.data || {}) as UpdateOrderStatusInput;

  if (!id || !isValidStatus(status)) {
    throw new HttpsError('invalid-argument', 'A valid order id and status are required.');
  }

  const orderRef = db.collection('orders').doc(id);

  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists) {
      throw new HttpsError('not-found', 'Order not found.');
    }

    const order = orderSnap.data();
    const currentStatus = order?.status || 'pending';
    const items = Array.isArray(order?.items) ? order.items : [];

    if (currentStatus === status) {
      return;
    }

    if (currentStatus === 'approved' && status !== 'approved') {
      for (const item of items) {
        const productRef = db.collection('products').doc(String(item.id || ''));
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists) {
          throw new HttpsError('not-found', `Product not found: ${item.id}`);
        }

        const product = productSnap.data();
        const currentStock = Number(product?.stock ?? 0);
        const quantity = Number(item.quantity ?? 0);

        transaction.update(productRef, {
          stock: currentStock + quantity
        });
      }
    }

    if (currentStatus !== 'approved' && status === 'approved') {
      for (const item of items) {
        const productRef = db.collection('products').doc(String(item.id || ''));
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists) {
          throw new HttpsError('not-found', `Product not found: ${item.id}`);
        }

        const product = productSnap.data();
        const currentStock = Number(product?.stock ?? 0);
        const quantity = Number(item.quantity ?? 0);

        if (currentStock < quantity) {
          throw new HttpsError('failed-precondition', `Insufficient stock for ${product?.name || item.id}.`);
        }

        transaction.update(productRef, {
          stock: currentStock - quantity
        });
      }
    }

    transaction.update(orderRef, { status });
  });

  return { ok: true };
});
