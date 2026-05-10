import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Update product stock by a delta value
 * @param {string} productId - The product ID
 * @param {number} delta - The amount to change stock by (negative to decrement, positive to increment)
 * @returns {Promise<void>}
 */
export const updateProductStock = async (productId, delta) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error(`Product ${productId} not found`);
    }

    const currentStock = productSnap.data().stock || 0;
    const newStock = Math.max(0, currentStock + delta); // Prevent negative stock

    await updateDoc(productRef, {
      stock: newStock
    });
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Process stock changes for an order
 * @param {Array} items - Order items with id and quantity
 * @param {number} direction - 1 to decrement (approved), -1 to increment (cancelled)
 * @returns {Promise<void>}
 */
export const processOrderStockChanges = async (items, direction) => {
  if (!items || !Array.isArray(items)) {
    throw new Error('Invalid items array');
  }

  try {
    await Promise.all(
      items.map((item) => {
        const stockDelta = -(item.quantity * direction); // Negative for decrement, positive for increment
        return updateProductStock(item.id, stockDelta);
      })
    );
  } catch (error) {
    console.error('Error processing order stock changes:', error);
    throw error;
  }
};
