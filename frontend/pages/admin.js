import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.replace('/login');
    if (user && user.role !== 'admin') router.replace('/');
  }, [user]);

  const fetchUsers = async () => {
    setError('');
    const pwd = window.prompt('Enter your admin password') || '';
    if (!pwd) return;
    setLoading(true);
    try {
      const res = await adminAPI.listUsers(user.username, pwd);
      setUsers(res.data || {});
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (username) => {
    if (!confirm(`Delete user ${username}? This cannot be undone.`)) return;
    const pwd = window.prompt('Enter your admin password') || '';
    if (!pwd) return;
    setLoading(true);
    try {
      await adminAPI.deleteUser(username, user.username, pwd);
      await fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (username) => {
    if (!confirm(`Promote ${username} to admin?`)) return;
    const pwd = window.prompt('Enter your admin password') || '';
    if (!pwd) return;
    setLoading(true);
    try {
      await adminAPI.setRole(username, 'admin', user.username, pwd);
      await fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Promotion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-24 pt-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div>
            <button onClick={fetchUsers} className="btn-primary">Refresh users</button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-300">{error}</div>}

        {loading && <div className="text-cyan-300">Loading...</div>}

        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-cyan-300 mb-4">Registered Users</h2>
          <div className="space-y-2">
            {Object.keys(users).length === 0 && <div className="text-cyan-300/70">No users found</div>}
            {Object.entries(users).map(([u, role]) => (
              <div key={u} className="flex items-center justify-between p-2 border-b border-slate-800">
                <div>
                  <div className="text-cyan-300 font-medium">{u}</div>
                  <div className="text-sm text-cyan-300/60">{role}</div>
                </div>
                <div>
                  {role !== 'admin' && (
                    <button onClick={() => handlePromote(u)} className="px-3 py-1 bg-emerald-500/70 rounded text-white mr-2">
                      Promote
                    </button>
                  )}
                  <button disabled={u === user.username} onClick={() => handleDelete(u)} className="px-3 py-1 bg-red-500/60 rounded text-white">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
