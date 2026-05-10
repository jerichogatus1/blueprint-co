import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../context/auth';
import LoadingSpinner from '../components/LoadingSpinner';

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadInitialProduct = async () => {
      if (active) {
        setLoading(true);
      }

      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (!active) {
          return;
        }

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialProduct();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProduct(false);
      }
    };

    const handleWindowFocus = () => {
      fetchProduct(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchProduct, id]);

  const addToCart = () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    if ((product.stock || 0) <= 0) {
      toast.error('This product is currently out of stock!');
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const effectivePrice = product.price ?? product.priceMin ?? 0;

    const existingItem = existingCart.find(item => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= (product.stock || 0)) {
        toast.error(`Cannot add more items. Only ${product.stock} available in stock.`);
        return;
      }
      existingItem.quantity += 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: effectivePrice,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return <LoadingSpinner label="Loading product" />;
  }

  if (!product) {
    return (
      <div className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15),_transparent_34%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.45em] text-amber-300/80">Blueprint Co.</p>
          <h1 className="mt-4 text-3xl font-bold text-white">Product Not Found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The product you&apos;re looking for does not exist or may have been removed.
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

  const isInStock = (product.stock || 0) > 0;

  return (
    <div className="relative overflow-hidden px-4 py-10 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Product detail</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              {product.name}
            </h1>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-white"
          >
            ← Back to Products
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6">
            <div className="flex h-full min-h-[26rem] items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/70">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center text-white/50">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/5 text-6xl">
                    🛡️
                  </div>
                  <p className="text-sm uppercase tracking-[0.35em]">No image available</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-amber-200">
                {product.category || 'Uncategorized'}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] ${
                  isInStock
                    ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                    : 'border border-rose-400/30 bg-rose-400/10 text-rose-200'
                }`}
              >
                {isInStock ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div>
              <p className="text-sm text-slate-400">Price</p>
              <p className="mt-2 text-3xl font-black text-amber-300">₱{(product.price ?? product.priceMin ?? 0).toLocaleString()}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Description</p>
              <p className="mt-3 leading-7 text-slate-200">
                {product.description || 'No description provided for this product yet.'}
              </p>
              {product.notes && (
                <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm italic text-amber-100/90">
                  {product.notes}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Availability</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {isInStock ? 'Ready to ship' : 'Waitlist only'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Category</p>
                <p className="mt-2 text-lg font-semibold text-white">{product.category || 'General'}</p>
              </div>
            </div>

            <button
              onClick={addToCart}
              disabled={!isInStock || !user}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-4 text-sm font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {user ? 'Add to Cart' : 'Sign in to Shop'}
            </button>
            {!user && (
              <Link
                to="/login"
                className="block rounded-full border border-white/20 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Sign In
              </Link>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
