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
        <div className="admin-page-actions">
           <p className="admin-page-sub">{users.length} total accounts · {users.filter(u=>u.active).length} active</p>
        </div>
      </div>

      <div className="users-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, .8fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Table list */}
        <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="ap-card-head" style={{ padding: '1.25rem' }}>
            <p className="ap-eyebrow">அணுகல் பட்டியல்</p>
            <h2>Portal Access List</h2>
          </div>

          <div className="table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>User / Profile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading system users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>No users found in database.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="pp-yama-row">
                      <td style={{ paddingLeft: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                          <div className="sidebar-avatar" style={{ width: '2rem', height: '2rem', fontSize: '.85rem' }}>
                            {(u.name || u.username)[0].toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '.9rem' }}>{u.name}</strong>
                            <span className="muted" style={{ fontSize: '.78rem' }}>@{u.username}</span>
                          </div>
                        </div>
                        {u.defaultPlace && (
                          <div style={{ marginTop: '.4rem', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: '.3rem', color: 'var(--muted)' }}>
                            <IconLocation size={12} />
                            <span>{u.defaultPlace.label || u.defaultPlace.name}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`role-chip ${u.role === 'admin' ? 'role-admin' : 'role-user'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                          {u.role === 'admin' && <IconShield size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={u.active ? 'status-on' : 'status-off'} style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', fontSize: '.85rem' }}>
                          {u.active ? <IconCheckCircle size={14} /> : <IconBan size={14} />}
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                        <button
                          className="ap-toggle-btn"
                          type="button"
                          onClick={() => toggleActive(u)}
                          disabled={u.role === 'admin'}
                        >
                          {u.active ? 'Disable Access' : 'Restore Access'}
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
        <div className="ap-card" style={{ position: 'sticky', top: '1.5rem' }}>
          <div className="ap-card-head">
            <span className="ap-eyebrow">புதிய பயனர்</span>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <IconUserPlus size={18} style={{ color: 'var(--accent)' }} />
              Invite New User
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
              <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.2rem' }}>User can change this later in their settings.</p>
            </div>
            
            {error   && <div className="ap-error">{error}</div>}
            {success && <div className="ap-success">{success}</div>}
            
            <button className="primary-button" type="submit" disabled={saving} style={{ marginTop: '.5rem' }}>
              {saving ? 'Creating Account...' : 'Create App User'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(244,239,230,.5)', borderRadius: '12px', fontSize: '.82rem', color: 'var(--muted)', border: '1px dashed var(--line)' }}>
            <strong>Note:</strong> New users are created with "User" role by default. Admins cannot disable other admins for security.
          </div>
        </div>

      </div>
    </div>
  );
}
