import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import Link from 'next/link';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.register(username, password);
      const role = res.data?.role || 'user';
      setSuccess('Registration successful! Logging you in...');
      setTimeout(() => {
        login({ username, role });
        router.push('/predict');
      }, 1000);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Registration failed';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute top-40 left-0 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center lg:grid-cols-2 gap-8">
        <div className="hidden lg:block">
          <div className="glass-base rounded-[2rem] p-10 border border-cyan-400/20 shadow-2xl shadow-purple-500/20">
            <div className="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-medium text-cyan-300 mb-8">
              Create your account
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Start using the churn prediction dashboard.
            </h1>
            <p className="text-lg text-cyan-300/80 leading-relaxed mb-10 max-w-xl">
              Create a secure account to access the prediction form, dashboard insights, and your workspace.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark rounded-2xl p-5 border border-cyan-400/20">
                <p className="text-sm text-cyan-300/70 mb-2">Simple setup</p>
                <p className="text-lg font-semibold text-white">Quick registration</p>
              </div>
              <div className="glass-dark rounded-2xl p-5 border border-purple-400/20">
                <p className="text-sm text-cyan-300/70 mb-2">Private account</p>
                <p className="text-lg font-semibold text-white">Protected access</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto lg:justify-self-end">
          <div className="glass-base rounded-[2rem] p-8 sm:p-10 border border-cyan-400/20 shadow-2xl shadow-purple-500/20 backdrop-blur-2xl">
            <div className="flex justify-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40">
                <span className="text-slate-950 font-black text-xl">CP</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-3 text-center">Create account</h1>
            <p className="text-cyan-300/75 text-center mb-8">Set up your workspace in a few seconds.</p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl border border-red-400/30 bg-red-500/10 backdrop-blur-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-100/90">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-xl flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-100/90">{success}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-cyan-100 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Choose a username"
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
                  placeholder="At least 6 characters"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cyan-100 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm your password"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-large flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : (
                  <>
                    Sign Up <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-cyan-400/20">
              <p className="text-center text-cyan-300/75">
                Already have an account?{' '}
                <Link href="/login" className="text-cyan-300 hover:text-cyan-200 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
