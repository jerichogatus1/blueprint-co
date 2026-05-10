function CartItem({ item, removeFromCart, updateQuantity }) {
  const price = (item.price ?? item.priceMin ?? 0) * item.quantity;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl">🛡️</span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{item.name}</h3>
          <p className="text-sm text-slate-400">₱{(item.price ?? item.priceMin ?? 0).toLocaleString()} each</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="min-w-10 text-center text-sm font-semibold text-white">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-amber-300">₱{price.toLocaleString()}</span>
          <button
            onClick={() => removeFromCart(item.id)}
            className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/20"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
