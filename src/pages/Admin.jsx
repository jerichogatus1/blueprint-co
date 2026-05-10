import { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import toast from 'react-hot-toast';
import { processOrderStockChanges } from '../utils/inventoryUtils';
import LoadingSpinner from '../components/LoadingSpinner';

function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
            const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
            return bTime - aTime;
          });

        if (active) {
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (id, newStatus) => {
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Find the order to get its items
      const order = orders.find(o => o.id === id);
      if (!order) {
        throw new Error('Order not found');
      }

      // Handle inventory changes based on status
      if (newStatus === 'approved' && order.status !== 'approved') {
        // Order is being approved - decrement stock
        await processOrderStockChanges(order.items, 1);
      } else if (newStatus === 'cancelled' && order.status !== 'cancelled') {
        // Order is being cancelled - increment stock back
        await processOrderStockChanges(order.items, -1);
      }

      await updateDoc(doc(db, 'orders', id), { status: newStatus });

      const successText =
        newStatus === 'approved'
          ? 'Order approved and inventory updated.'
          : newStatus === 'rejected'
            ? 'Order declined.'
          : newStatus === 'cancelled'
              ? 'Order cancelled and inventory restored.'
              : 'Order status updated.';
      toast.success(successText);
      setSuccessMessage(successText);
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
          const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
          return bTime - aTime;
        });
      setOrders(ordersData);
    } catch (error) {
      const message = error.message || 'Failed to update status';
      console.error('Error updating status:', error);
      toast.error(message);
      setErrorMessage(message);
    }
  };

  const actionButtons = [
    {
      value: 'approved',
      label: 'Approve',
      badgeClass: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200',
      activeClass: 'border-emerald-300/50 bg-emerald-400/30 text-emerald-50 shadow-[0_0_0_1px_rgba(110,231,183,0.35)]',
      inactiveClass: 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/30 hover:bg-emerald-400/12 hover:text-emerald-100'
    },
    {
      value: 'rejected',
      label: 'Decline',
      badgeClass: 'border-rose-400/30 bg-rose-400/15 text-rose-200',
      activeClass: 'border-rose-300/50 bg-rose-400/30 text-rose-50 shadow-[0_0_0_1px_rgba(251,113,133,0.35)]',
      inactiveClass: 'border-white/10 bg-white/5 text-slate-300 hover:border-rose-400/30 hover:bg-rose-400/12 hover:text-rose-100'
    },
    {
      value: 'cancelled',
      label: 'Cancel',
      badgeClass: 'border-slate-300/30 bg-slate-300/15 text-slate-100',
      activeClass: 'border-slate-100/50 bg-slate-200/30 text-slate-950 shadow-[0_0_0_1px_rgba(226,232,240,0.35)]',
      inactiveClass: 'border-white/10 bg-white/5 text-slate-300 hover:border-slate-300/30 hover:bg-slate-300/12 hover:text-white'
    }
  ];

  if (loading) {
    return <LoadingSpinner label="Loading admin data" />;
  }

  return (
    <div className="relative overflow-hidden px-4 py-10 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Admin console</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Order Management
          </h1>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-100">
            {errorMessage}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300 shadow-2xl shadow-black/25 backdrop-blur-xl">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/25 backdrop-blur-xl">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  <th className="px-4 py-4 font-semibold">Date</th>
                  <th className="px-4 py-4 font-semibold">Customer</th>
                  <th className="px-4 py-4 font-semibold">Email</th>
                  <th className="px-4 py-4 font-semibold">Shipping</th>
                  <th className="px-4 py-4 font-semibold">Items</th>
                  <th className="px-4 py-4 font-semibold">Total</th>
                  <th className="px-4 py-4 font-semibold">Payment</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 text-slate-300">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-4">
                      {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-white">{order.customerName}</td>
                    <td className="px-4 py-4">{order.customerEmail}</td>
                    <td className="px-4 py-4">
                      {order.shippingAddress
                        ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      {order.items?.map((item) => `${item.name} (${item.quantity})`).join(', ') || 'N/A'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-amber-300">
                      ₱{Number(order.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">{order.paymentMethod}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                          order.status === 'approved'
                            ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
                          : order.status === 'rejected'
                              ? 'border-rose-400/30 bg-rose-400/15 text-rose-200'
                              : order.status === 'cancelled'
                                ? 'border-slate-300/30 bg-slate-300/15 text-slate-100'
                              : 'border-amber-400/30 bg-amber-400/15 text-amber-100'
                        }`}
                      >
                        {order.status === 'rejected' ? 'declined' : order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {actionButtons.map((button) => {
                          const isActive = order.status === button.value;
                          return (
                            <button
                              key={button.value}
                              onClick={() => updateStatus(order.id, button.value)}
                              aria-pressed={isActive}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                isActive ? button.activeClass : button.inactiveClass
                              }`}
                            >
                              {button.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
