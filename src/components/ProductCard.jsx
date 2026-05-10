import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/auth';

function ProductCard({ product }) {
  const { user } = useAuth();
  const addToCart = (e) => {
    e.preventDefault();

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

    const existingItem = existingCart.find((item) => item.id === product.id);

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

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="group h-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/8">
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-56 items-center justify-center text-4xl">🛡️</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-white">{product.name}</h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                (product.stock || 0) > 0
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-rose-400/15 text-rose-300'
              }`}
            >
              {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-slate-300">{product.description}</p>
          <p className="text-sm text-slate-400">{product.category}</p>
          <p className="text-lg font-semibold text-amber-300">₱{(product.price ?? product.priceMin ?? 0).toLocaleString()}</p>
        </div>

        <button
          onClick={addToCart}
          disabled={(product.stock || 0) <= 0 || !user}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 py-3 font-semibold text-slate-950 transition hover:from-amber-300 hover:to-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {user ? 'Add to Cart' : 'Sign in to Shop'}
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;
