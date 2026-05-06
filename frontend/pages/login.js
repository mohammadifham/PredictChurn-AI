import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(username, password);
      login(username);
      router.push('/predict');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute top-32 right-0 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center lg:grid-cols-2 gap-8">
        <div className="hidden lg:block">
          <div className="glass-base rounded-[2rem] p-10 border border-cyan-400/20 shadow-2xl shadow-cyan-500/20">
            <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 mb-8">
              Secure access
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Welcome back to the prediction platform.
            </h1>
            <p className="text-lg text-cyan-300/80 leading-relaxed mb-10 max-w-xl">
              Sign in to continue using the churn prediction dashboard, model insights, and customer analysis tools.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark rounded-2xl p-5 border border-cyan-400/20">
                <p className="text-sm text-cyan-300/70 mb-2">Fast access</p>
                <p className="text-lg font-semibold text-white">Secure login flow</p>
              </div>
              <div className="glass-dark rounded-2xl p-5 border border-purple-400/20">
                <p className="text-sm text-cyan-300/70 mb-2">Protected data</p>
                <p className="text-lg font-semibold text-white">Private workspace</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto lg:justify-self-end">
          <div className="glass-base rounded-[2rem] p-8 sm:p-10 border border-cyan-400/20 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl">
            <div className="flex justify-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <span className="text-slate-950 font-black text-xl">CP</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-3 text-center">Sign in</h1>
            <p className="text-cyan-300/75 text-center mb-8">Access your churn prediction workspace.</p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl border border-red-400/30 bg-red-500/10 backdrop-blur-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-100/90">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-cyan-100 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Enter your username"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cyan-100 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-large flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : (
                  <>
                    Sign In <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-cyan-400/20">
              <p className="text-center text-cyan-300/75">
                Don't have an account?{' '}
                <Link href="/register" className="text-cyan-300 hover:text-cyan-200 font-semibold">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
