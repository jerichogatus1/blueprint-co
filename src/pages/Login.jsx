import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const profileRole = userDoc.exists() ? userDoc.data()?.role : null;
      const isAdmin = tokenResult.claims?.admin === true || profileRole === 'admin';

      if (userDoc.exists()) {
        if (isAdmin) {
          toast.success('Admin logged in successfully!');
          navigate('/admin');
        } else {
          toast.success('Logged in successfully!');
          navigate('/');
        }
      } else {
        const userData = {
          name: userCredential.user.displayName || 'Customer',
          email: userCredential.user.email,
          createdAt: new Date()
        };

        if (isAdmin) {
          userData.role = 'admin';
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        if (isAdmin) {
          toast.success('Admin logged in successfully!');
          navigate('/admin');
        } else {
          toast.success('Logged in successfully!');
          navigate('/');
        }
      }
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden px-4 py-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-8 shadow-2xl shadow-black/25 backdrop-blur-xl md:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">Welcome back</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
            Login
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Sign in to review orders, manage your cart, and access admin tools if your account has access.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Secure access</p>
              <p className="mt-2 text-sm text-slate-200">Roles are resolved from claims and user profile data.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Fast checkout</p>
              <p className="mt-2 text-sm text-slate-200">Jump straight back into shopping after sign in.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40 focus:bg-slate-950"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-4 text-sm font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-sm text-slate-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-amber-300 hover:text-amber-200">
                Register here
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;
