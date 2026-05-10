import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Inventory = lazy(() => import('./pages/Inventory'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Loading session" />;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, profile, claims, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Loading access" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = claims?.admin === true || profile?.role === 'admin';

  return isAdmin ? (
    children
  ) : (
    <div className="relative overflow-hidden px-4 py-20 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.45em] text-amber-300/80">Access denied</p>
        <h1 className="mt-4 text-3xl font-black text-white">Unauthorized</h1>
        <p className="mt-3 text-slate-300">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner label="Loading page" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <AdminRoute>
                      <Inventory />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
