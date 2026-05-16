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
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState({});

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

  const createUser = async () => {
    const username = window.prompt('New username') || '';
    if (!username) return;
    const password = window.prompt('Password (min 8 chars)') || '';
    if (!password) return;
    const role = window.prompt('Role (admin or user)', 'user') || 'user';
    const pwd = window.prompt('Enter your admin password') || '';
    if (!pwd) return;
    setLoading(true);
    try {
      await adminAPI.createUser(user.username, pwd, username, password, role);
      await fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async (username) => {
    const newPassword = window.prompt(`Enter new password for ${username}`) || '';
    if (!newPassword) return;
    const pwd = window.prompt('Enter your admin password') || '';
    if (!pwd) return;
    setLoading(true);
    try {
      await adminAPI.setPassword(user.username, pwd, username, newPassword);
      await fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = [['username','role']];
    Object.entries(users).forEach(([u, r]) => rows.push([u, r]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const toggleSelect = (username) => {
    setSelected(prev => ({ ...prev, [username]: !prev[username] }));
  };

  const bulkAction = async (action) => {
    const usersToAct = Object.keys(selected).filter(u => selected[u]);
    if (usersToAct.length === 0) return setError('No users selected');
    if (!confirm(`${action} ${usersToAct.length} users?`)) return;
    const pwd = window.prompt('Enter your admin password') || '';
    if (!pwd) return;
    setLoading(true);
    try {
      await adminAPI.bulkAction(user.username, pwd, action, usersToAct);
      setSelected({});
      await fetchUsers();
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Bulk action failed');
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
          <div className="flex items-center space-x-3">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search username or role" className="px-3 py-2 rounded bg-slate-800 text-cyan-200" />
            <button onClick={fetchUsers} className="btn-primary">Refresh users</button>
            <button onClick={createUser} className="btn-primary/outline">Create user</button>
            <button onClick={exportCSV} className="btn-primary/outline">Export CSV</button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-300">{error}</div>}

        {loading && <div className="text-cyan-300">Loading...</div>}

        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-cyan-300 mb-4">Registered Users</h2>
          <div className="space-y-2">
            {Object.keys(users).length === 0 && (
              <div className="text-cyan-300/70">No users loaded — click "Refresh users" and enter your admin password to load the list.</div>
            )}
            {Object.entries(users).filter(([u, r]) => (u.includes(query) || r.includes(query))).map(([u, role]) => (
              <div key={u} className="flex items-center justify-between p-2 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked={!!selected[u]} onChange={()=>toggleSelect(u)} />
                  <div>
                    <div className="text-cyan-300 font-medium">{u}</div>
                    <div className="text-sm text-cyan-300/60">{role}</div>
                  </div>
                </div>
                <div>
                  <button onClick={() => setPassword(u)} className="px-3 py-1 bg-yellow-500/70 rounded text-white mr-2">Set Password</button>
                  {role !== 'admin' && (
                    <button onClick={() => handlePromote(u)} className="px-3 py-1 bg-emerald-500/70 rounded text-white mr-2">
                      Promote
                    </button>
                  )}
                  <button disabled={u === user.username} onClick={() => handleDelete(u)} className="px-3 py-1 bg-red-500/60 rounded text-white">Delete</button>
                </div>
              </div>
            ))}
            {Object.keys(users).length > 0 && (
              <div className="flex items-center space-x-2 mt-4">
                <button onClick={() => bulkAction('promote')} className="px-3 py-1 bg-emerald-500/70 rounded text-white">Bulk Promote</button>
                <button onClick={() => bulkAction('delete')} className="px-3 py-1 bg-red-500/60 rounded text-white">Bulk Delete</button>
                <button onClick={() => bulkAction('demote')} className="px-3 py-1 bg-slate-600/60 rounded text-white">Bulk Demote</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
