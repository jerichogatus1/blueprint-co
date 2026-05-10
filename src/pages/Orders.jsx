import { useCallback, useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { processOrderStockChanges } from '../utils/inventoryUtils';
import LoadingSpinner from '../components/LoadingSpinner';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchOrders = useCallback(async (email) => {
    try {
      const q = query(collection(db, 'orders'), where('customerEmail', '==', email));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const date = data.createdAt?.toDate?.();
          return {
            id: doc.id,
            ...data,
            createdAtRaw: date,
            createdAt: date ? date.toLocaleDateString() : 'N/A'
          };
        })
        .sort((a, b) => {
          if (!a.createdAtRaw || !b.createdAtRaw) return 0;
          return b.createdAtRaw - a.createdAtRaw;
        });

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        void fetchOrders(currentUser.email);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [fetchOrders]);

  const getStatusTone = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'border-amber-400/20 bg-amber-400/10 text-amber-200';
      case 'approved':
        return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
      case 'shipped':
        return 'border-sky-400/20 bg-sky-400/10 text-sky-200';
      case 'delivered':
        return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
      case 'cancelled':
        return 'border-rose-400/20 bg-rose-400/10 text-rose-200';
      case 'rejected':
        return 'border-rose-400/20 bg-rose-400/10 text-rose-200';
      default:
        return 'border-white/10 bg-white/5 text-slate-200';
    }
  };

  const formatStatus = (status) => {
    if (status === 'rejected') return 'declined';
    return status || 'pending';
  };

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm('Cancel this order? This cannot be undone.');
    if (!confirmed) return;

    try {
      // Find the order to get its items
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // If order was approved, restore the stock
      if (order.status === 'approved') {
        await processOrderStockChanges(order.items, -1);
      }

      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled'
      });
      toast.success('Order cancelled and inventory restored');
      if (user?.email) {
        await fetchOrders(user.email);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  if (!user) {
    return (
      <div className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h1 className="text-3xl font-black text-white">Please Login</h1>
          <p className="mt-3 text-sm text-slate-300">Login to view your order history.</p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner label="Loading orders" />;
  }

  if (orders.length === 0) {
    return (
      <div className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h1 className="text-3xl font-black text-white">No Orders Yet</h1>
          <p className="mt-3 text-sm text-slate-300">Your order history will appear here after checkout.</p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden px-4 py-10 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Order history</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            My Orders
          </h1>
        </div>

        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">Date: {order.createdAt}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] ${getStatusTone(
                    order.status
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-slate-400">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-amber-300">
                      ₱{Number(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Total
                </span>
                <span className="text-lg font-black text-amber-300">
                  ₱{order.totalPrice?.toLocaleString() || '0'}
                </span>
              </div>

              {order.shippingAddress && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Shipping Address</p>
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>
                      {order.shippingAddress.line1}
                      {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                    </p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {order.status === 'pending' && (
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/20"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;
