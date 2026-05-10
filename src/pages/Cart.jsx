import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import CartItem from '../components/CartItem';

function Cart() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item));
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const totalPrice = cart.reduce((total, item) => total + (((item.price ?? item.priceMin) || 0) * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-4xl">
            🛒
          </div>
          <h1 className="mt-5 text-3xl font-black text-white">Your Cart is Empty</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Browse the catalog and add protective gear to continue checkout.
          </p>
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

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Ready to check out</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Shopping Cart
            </h1>
          </div>
          <p className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            ))}
          </div>

          <aside className="h-fit rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Order summary</p>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">₱{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span className="text-amber-300">₱{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-4 text-sm font-bold text-slate-950 transition hover:scale-[1.01]"
            >
              Proceed to Checkout
            </button>

            <p className="mt-3 text-center text-sm text-slate-400">
              {isLoggedIn ? 'You are logged in' : 'Please login to checkout'}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;
