import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        if (active) {
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const updateStock = async (productId, newStock) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: parseInt(newStock, 10)
      });
      toast.success('Stock updated successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading inventory" />;
  }

  return (
    <div className="relative overflow-hidden px-4 py-10 md:py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Inventory control</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Inventory Management
          </h1>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-200">
              <tr>
                <th className="px-4 py-4 font-semibold">Product</th>
                <th className="px-4 py-4 font-semibold">Category</th>
                <th className="px-4 py-4 font-semibold">Price</th>
                <th className="px-4 py-4 font-semibold">Current Stock</th>
                <th className="px-4 py-4 font-semibold">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-slate-300">
              {products.map((product) => (
                <tr key={product.id} className="align-middle">
                  <td className="px-4 py-4 text-white">{product.name}</td>
                  <td className="px-4 py-4">{product.category}</td>
                  <td className="px-4 py-4 font-semibold text-amber-300">
                    ₱{(product.price ?? product.priceMin ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">{product.stock || 0}</td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.stock || 0}
                      onBlur={(e) => updateStock(product.id, e.target.value)}
                      className="w-24 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-white/10"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
