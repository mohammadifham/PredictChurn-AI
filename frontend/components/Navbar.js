import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Zap } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const navLinks = user
    ? [
        { href: '/', label: 'Home' },
        { href: '/predict', label: 'Predict' },
        { href: '/dashboard', label: 'Dashboard' },
        ...(user.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
      ]
    : [{ href: '/', label: 'Home' }];

  const isActive = (path) => router.pathname === path;

  return (
    <nav className="glass-base fixed top-0 w-full z-50 border-b border-cyan-500/20 shadow-2xl shadow-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300">
                <Zap className="text-slate-950 font-bold w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text hidden sm:inline">CP</span>
            </Link>
            
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? 'text-cyan-300 border-b-2 border-cyan-400 pb-1 shadow-md shadow-cyan-500/50'
                      : 'text-cyan-200 hover:text-cyan-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-cyan-400/70 uppercase tracking-wider">User</p>
                    <p className="text-sm font-semibold text-cyan-300">{user.username}</p>
                    {user.role === 'admin' && (
                      <p className="text-xs text-emerald-300">Admin</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-cyan-300 border border-cyan-400/50 rounded-lg hover:border-cyan-300 hover:text-cyan-200 font-medium transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/40 glass-dark"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded-lg hover:from-cyan-300 hover:to-blue-400 font-medium transition-all duration-300 shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-400/70"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
