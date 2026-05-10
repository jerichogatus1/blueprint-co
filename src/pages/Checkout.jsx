import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'Philippines'
  });
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + (((item.price ?? item.priceMin) || 0) * item.quantity), 0);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setShippingAddress((current) => ({
      ...current,
      [name]: value
    }));
  };

  const isAddressComplete = () =>
    shippingAddress.fullName.trim() &&
    shippingAddress.phone.trim() &&
    shippingAddress.line1.trim() &&
    shippingAddress.city.trim() &&
    shippingAddress.region.trim() &&
    shippingAddress.postalCode.trim() &&
    shippingAddress.country.trim();

  const getPaymentErrorMessage = (error) => {
    const rawMessage = String(error?.message || '').toLowerCase();
    const rawCode = String(error?.code || '').toLowerCase();

    if (rawCode.includes('unauthenticated') || rawMessage.includes('unauthenticated')) {
      return 'Please log in again before placing your order.';
    }

    if (rawCode.includes('permission-denied') || rawMessage.includes('permission-denied')) {
      return 'You do not have permission to place this order.';
    }

    if (
      rawCode.includes('failed-precondition') ||
      rawMessage.includes('insufficient stock') ||
      rawMessage.includes('shipping address is incomplete')
    ) {
      return error?.message || 'Please check stock and shipping details, then try again.';
    }

    if (
      rawCode.includes('internal') ||
      rawMessage.includes('cors') ||
      rawMessage.includes('cloudfunctions.net') ||
      rawMessage.includes('failed to fetch')
    ) {
      return 'Payment service is not reachable right now.';
    }

    return 'Failed to process payment. Please try again.';
  };

  const handlePayment = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to proceed');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!isAddressComplete()) {
      toast.error('Please complete your shipping address');
      return;
    }

    setProcessing(true);

    try {
      const normalizedItems = [];
      let totalPrice = 0;

      for (const item of cart) {
        const productSnap = await getDoc(doc(db, 'products', item.id));

        if (!productSnap.exists()) {
          throw new Error(`Product not found: ${item.name}`);
        }

        const product = productSnap.data();
        const quantity = Number(item.quantity || 0);
        const availableStock = Number(product.stock || 0);
        const unitPrice = Number(product.price ?? product.priceMin ?? item.price ?? 0);

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for ${item.name}.`);
        }

        if (availableStock < quantity) {
          throw new Error(`Insufficient stock for ${product.name || item.name}.`);
        }

        normalizedItems.push({
          id: item.id,
          name: product.name || item.name,
          price: unitPrice,
          quantity
        });

        totalPrice += unitPrice * quantity;
      }

      const orderRef = await addDoc(collection(db, 'orders'), {
        items: normalizedItems,
        totalPrice,
        status: 'pending',
        paymentMethod,
        shippingAddress,
        customerEmail: auth.currentUser.email,
        customerName: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });

      setCart([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Order placed successfully!');
      navigate('/orders', {
        state: {
          orderId: orderRef.id,
          totalPrice
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(getPaymentErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h1 className="text-3xl font-black text-white">Your Cart is Empty</h1>
          <p className="mt-3 text-sm text-slate-300">Add products before checking out.</p>
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

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr]">
        <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Secure checkout</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Checkout
            </h1>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Order summary</p>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-slate-950/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-amber-300">
                    ₱{(((item.price ?? item.priceMin) || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-lg font-bold text-white">
              <span>Total</span>
              <span className="text-amber-300">₱{getTotalPrice().toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Shipping address</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Street Address</label>
                <input
                  type="text"
                  name="line1"
                  value={shippingAddress.line1}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="Unit 12, Blue Tower, 123 Main Street"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Address Line 2</label>
                <input
                  type="text"
                  name="line2"
                  value={shippingAddress.line2}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="Barangay / Landmark (optional)"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="Manila"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Region / Province</label>
                <input
                  type="text"
                  name="region"
                  value={shippingAddress.region}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="Metro Manila"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Country</label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                  placeholder="Philippines"
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl md:p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Payment method</p>
          <div className="mt-5 space-y-3">
            {[
              ['gcash', 'GCash'],
              ['cod', 'Cash on Delivery'],
              ['paymaya', 'PayMaya'],
              ['credit_card', 'Credit Card']
            ].map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  paymentMethod === value
                    ? 'border-amber-400/40 bg-amber-400/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 accent-amber-400"
                />
                <span className="text-sm font-medium text-white">{label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-4 text-sm font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay ₱${getTotalPrice().toLocaleString()}`}
          </button>

          <p className="mt-3 text-center text-sm text-slate-400">
            Shipping details are saved to Firestore with the order.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
