import { useEffect, useState } from 'react';
import { createAdminUser, loadAdminUsers, updateAdminUser } from '../../api.js';
import { IconLocation, IconUserPlus, IconShield, IconBan, IconCheckCircle } from '../../components/Icons.jsx';

const BLANK = { name: '', username: '', password: '' };

export function UsersPage() {
  const [users, setUsers]   = useState([]);
  const [form, setForm]     = useState(BLANK);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const d = await loadAdminUsers();
      setUsers(d.users || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await createAdminUser({ ...form, role: 'user', active: true });
      setForm(BLANK);
      setSuccess('User created successfully.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u) {
    await updateAdminUser(u.id, { active: !u.active });
    await refresh();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">பயனர் மேலாண்மை · Access Control</p>
          <h1 className="admin-page-title">Users</h1>
        </div>
        <div className="admin-page-actions text-right">
           <p className="admin-page-sub">{users.length} total accounts · {users.filter(u=>u.active).length} active</p>
        </div>
      </div>

      <div className="users-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, .8fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Table list */}
        <div className="ap-card" style={{ padding: 0 }}>
          <div className="ap-card-head" style={{ padding: '2rem 2rem 1rem' }}>
            <p className="ap-eyebrow">அணுகல் பட்டியல்</p>
            <h2>Portal Access List</h2>
          </div>

          <div className="table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '2rem' }}>User / Profile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-slate-400 font-medium">Loading system users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-slate-400 font-medium">No users found in database.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="pp-yama-row">
                      <td style={{ paddingLeft: '2rem' }}>
                        <div className="flex items-center gap-3">
                          <div className="sidebar-avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '1rem', borderRadius: '12px' }}>
                            {(u.name || u.username)[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <strong className="text-sm text-slate-900">{u.name}</strong>
                            <span className="text-xs text-slate-400 font-medium">@{u.username}</span>
                          </div>
                        </div>
                        {u.defaultPlace && (
                          <div className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                            <IconLocation size={10} className="text-amber-500" />
                            <span>{u.defaultPlace.label || u.defaultPlace.name}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`role-chip ${u.role === 'admin' ? 'role-admin' : 'role-user'} flex items-center gap-1 w-fit`}>
                          {u.role === 'admin' && <IconShield size={10} />}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`${u.active ? 'status-on' : 'status-off'} flex items-center gap-1.5 text-xs`}>
                          {u.active ? <IconCheckCircle size={14} /> : <IconBan size={14} />}
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                        <button
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-200 ${u.active ? 'text-rose-600 border-rose-100 hover:bg-rose-50' : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}
                          type="button"
                          onClick={() => toggleActive(u)}
                          disabled={u.role === 'admin'}
                          style={{ opacity: u.role === 'admin' ? 0.3 : 1 }}
                        >
                          {u.active ? 'Disable' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Form */}
        <div className="ap-card" style={{ position: 'sticky', top: '2rem' }}>
          <div className="ap-card-head">
            <span className="ap-eyebrow">புதிய பயனர்</span>
            <h2 className="flex items-center gap-3">
              <IconUserPlus size={22} className="text-amber-500" />
              Invite User
            </h2>
          </div>

          <form onSubmit={handleCreate} className="ap-form">
            <div className="ap-field">
              <label>Full Display Name · பெயர்</label>
              <input className="text-input" value={form.name} onChange={field('name')} placeholder="e.g. Dheena" required />
            </div>
            <div className="ap-field">
              <label>System Username · பயனர்பெயர்</label>
              <input className="text-input" value={form.username} onChange={field('username')} placeholder="e.g. dheena_admin" required />
            </div>
            <div className="ap-field">
              <label>Temporary Password · கடவுச்சொல்</label>
              <input className="text-input" type="password" value={form.password} onChange={field('password')} placeholder="••••••••" required />
              <p className="text-[10px] text-slate-400 font-medium mt-1 ml-1">User can change this later in their settings.</p>
            </div>
            
            {error   && <div className="ap-error">{error}</div>}
            {success && <div className="ap-success">{success}</div>}
            
            <button className="primary-button" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
              {saving ? 'Creating Account...' : 'Create App User'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700 block mb-1">Security Note:</strong> New users are created with "User" role by default. Admins cannot disable other admins for data integrity.
          </div>
        </div>

      </div>
    </div>
  );
}

