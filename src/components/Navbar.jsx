import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';

function Navbar() {
  const { user, profile, claims } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const linkClass =
    'rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/Logo.png"
            alt="Blueprint Co. logo"
            className="h-14 w-14 rounded-full bg-white/10 p-1.5 object-contain shadow-lg shadow-black/25 md:h-16 md:w-16"
          />
          <div className="leading-tight">
            <span className="block text-xl font-black tracking-[0.25em] text-amber-200 md:text-2xl">
              BLUEPRINT CO.
            </span>
            <span className="block text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
              Protection gear, reimagined
            </span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Link to="/" className={linkClass}>
            Home
          </Link>
          <Link to="/products" className={linkClass}>
            Products
          </Link>

          {user ? (
            <>
              <Link to="/cart" className={linkClass + ' relative'}>
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[11px] font-bold text-slate-950">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" className={linkClass}>
                Orders
              </Link>
              {(claims?.admin === true || profile?.role === 'admin') && (
                <>
                  <Link to="/admin" className={linkClass}>
                    Admin
                  </Link>
                  <Link to="/inventory" className={linkClass}>
                    Inventory
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
