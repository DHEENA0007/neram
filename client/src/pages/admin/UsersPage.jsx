import { useEffect, useState, useMemo } from 'react';
import { createAdminUser, loadAdminUsers, updateAdminUser } from '../../api.js';
import { IconLocation, IconUserPlus, IconShield, IconBan, IconCheckCircle } from '../../components/Icons.jsx';

/* ── Password strength ───────────────────────────────── */
const RULES = [
  { key: 'len',     label: 'At least 8 characters',        test: p => p.length >= 8 },
  { key: 'upper',   label: 'One uppercase letter (A–Z)',    test: p => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'One lowercase letter (a–z)',    test: p => /[a-z]/.test(p) },
  { key: 'digit',   label: 'One number (0–9)',              test: p => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character (!@#…)',  test: p => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(p) {
  if (!p) return 0;
  return RULES.filter(r => r.test(p)).length;
}

const STRENGTH_LABEL = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-600'];
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-emerald-500', 'text-emerald-600'];

function PasswordStrength({ password }) {
  const score = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? STRENGTH_COLOR[score] : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-[10px] font-black ${STRENGTH_TEXT[score]}`}>{STRENGTH_LABEL[score]}</p>
      {/* Rules checklist */}
      <div className="grid grid-cols-1 gap-0.5">
        {RULES.map(r => {
          const ok = r.test(password);
          return (
            <div key={r.key} className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
              <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                {ok ? '✓' : '○'}
              </span>
              {r.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Username validation ─────────────────────────────── */
function validateUsername(u) {
  if (!u) return 'Username is required';
  if (u.length < 3) return 'At least 3 characters';
  if (u.length > 32) return 'Max 32 characters';
  if (!/^[a-z0-9_]+$/.test(u)) return 'Only lowercase letters, numbers, underscore';
  return null;
}

/* ── Field component ─────────────────────────────────── */
function Field({ label, hint, error, children }) {
  return (
    <div className="ap-field">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
      {children}
      {hint  && !error && <p className="text-[10px] text-slate-400 font-medium mt-1">{hint}</p>}
      {error && <p className="text-[10px] text-rose-500 font-bold mt-1">⚠ {error}</p>}
    </div>
  );
}

const BLANK = { name: '', username: '', password: '', confirmPassword: '', role: 'user' };

/* ── Main Page ───────────────────────────────────────── */
export function UsersPage() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // form mode: 'create' | 'edit'
  const [mode, setMode]     = useState('create');
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState(BLANK);
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched]   = useState({});

  async function refresh() {
    setLoading(true);
    try { const d = await loadAdminUsers(); setUsers(d.users || []); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  function field(key) {
    return (e) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      setTouched(t => ({ ...t, [key]: true }));
    };
  }

  function startEdit(u) {
    setMode('edit');
    setEditId(u.id);
    setForm({ name: u.name || '', username: u.username || '', password: '', confirmPassword: '', role: u.role || 'user' });
    setTouched({});
    setError(''); setSuccess('');
    setShowPass(false);
  }

  function startCreate() {
    setMode('create');
    setEditId(null);
    setForm(BLANK);
    setTouched({});
    setError(''); setSuccess('');
    setShowPass(false);
  }

  /* ── Derived validation ── */
  const usernameErr = touched.username ? validateUsername(form.username) : null;
  const nameErr     = touched.name && !form.name.trim() ? 'Full name is required' : null;
  const passScore   = getStrength(form.password);
  const passErr     = touched.password && form.password && passScore < 3 ? 'Password is too weak' : null;
  const confirmErr  = touched.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match' : null;

  const canSubmit = useMemo(() => {
    if (!form.name.trim() || !form.username.trim()) return false;
    if (validateUsername(form.username)) return false;
    if (mode === 'create') {
      if (!form.password || passScore < 3) return false;
      if (form.password !== form.confirmPassword) return false;
    }
    if (mode === 'edit' && form.password) {
      if (passScore < 3) return false;
      if (form.password !== form.confirmPassword) return false;
    }
    return true;
  }, [form, passScore, mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, username: true, password: true, confirmPassword: true });
    if (!canSubmit) return;
    setError(''); setSuccess(''); setSaving(true);
    try {
      if (mode === 'create') {
        await createAdminUser({ name: form.name.trim(), username: form.username.trim(), password: form.password, role: form.role, active: true });
        setSuccess('User created successfully.');
        startCreate();
      } else {
        const patch = { name: form.name.trim(), username: form.username.trim(), role: form.role };
        if (form.password) patch.password = form.password;
        await updateAdminUser(editId, patch);
        setSuccess('User updated successfully.');
        startCreate();
      }
      await refresh();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u) {
    await updateAdminUser(u.id, { active: !u.active });
    await refresh();
  }

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">பயனர் மேலாண்மை · Access Control</p>
          <h1 className="admin-page-title">Users</h1>
        </div>
        <div className="admin-page-actions text-right">
          <p className="admin-page-sub">{users.length} total · {users.filter(u=>u.active).length} active</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(320px,.6fr)', gap: '2rem', alignItems: 'start' }}>

        {/* ── User Table ── */}
        <div className="ap-card" style={{ padding: 0 }}>
          <div className="ap-card-head" style={{ padding: '1.5rem 2rem 1rem' }}>
            <p className="ap-eyebrow">அணுகல் பட்டியல்</p>
            <h2>Portal Access List</h2>
          </div>
          <div className="table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '2rem' }}>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="py-16 text-center text-slate-400 font-medium">Loading users…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="py-16 text-center text-slate-400 font-medium">No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className={`pp-yama-row ${editId === u.id ? 'bg-amber-50/60' : ''}`}>
                    <td style={{ paddingLeft: '2rem' }}>
                      <div className="flex items-center gap-3">
                        <div className={`sidebar-avatar flex-shrink-0`} style={{ width: '2.2rem', height: '2.2rem', fontSize: '0.9rem', borderRadius: '10px', background: u.role === 'admin' ? '#b45309' : '#64748b' }}>
                          {(u.name || u.username || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <strong className="text-sm text-slate-900 truncate">{u.name || '—'}</strong>
                          <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                        </div>
                      </div>
                      {u.defaultPlace && (
                        <div className="mt-1.5 text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider ml-1">
                          <IconLocation size={10} className="text-amber-500 shrink-0" />
                          <span className="truncate">{u.defaultPlace.label || u.defaultPlace.name}</span>
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
                        {u.active ? <IconCheckCircle size={13} /> : <IconBan size={13} />}
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 font-medium">{fmtDate(u.createdAt)}</td>
                    <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(u)}
                          className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-amber-100 text-amber-600 hover:bg-amber-50 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(u)}
                          disabled={u.role === 'admin'}
                          style={{ opacity: u.role === 'admin' ? 0.3 : 1 }}
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${u.active ? 'text-rose-600 border-rose-100 hover:bg-rose-50' : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}
                        >
                          {u.active ? 'Disable' : 'Restore'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Create / Edit Form ── */}
        <div className="ap-card" style={{ position: 'sticky', top: '2rem' }}>
          <div className="ap-card-head">
            <span className="ap-eyebrow">{mode === 'create' ? 'புதிய பயனர்' : 'பயனர் திருத்தம்'}</span>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2">
                <IconUserPlus size={20} className="text-amber-500" />
                {mode === 'create' ? 'Create User' : 'Edit User'}
              </h2>
              {mode === 'edit' && (
                <button type="button" onClick={startCreate} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                  + New
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="ap-form" noValidate>

            {/* Full Name */}
            <Field label="Full Name · பெயர்" error={nameErr}>
              <input
                className={`text-input ${nameErr ? 'border-rose-300' : ''}`}
                value={form.name}
                onChange={field('name')}
                onBlur={() => setTouched(t => ({...t, name: true}))}
                placeholder="Full Name"
                required
              />
            </Field>

            {/* Username */}
            <Field label="Username · பயனர்பெயர்" hint="Lowercase letters, numbers, underscore only" error={usernameErr}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">@</span>
                <input
                  className={`text-input pl-7 font-mono ${usernameErr ? 'border-rose-300' : ''}`}
                  value={form.username}
                  onChange={e => { field('username')(e); }}
                  onBlur={() => setTouched(t => ({...t, username: true}))}
                  placeholder="username"
                  required
                  autoComplete="off"
                />
              </div>
            </Field>

            {/* Role */}
            <Field label="Role · பங்கு">
              <div className="flex gap-2 mt-1">
                {[
                  { val: 'user',  label: 'User',  icon: null },
                  { val: 'admin', label: 'Admin', icon: <IconShield size={12} /> },
                ].map(r => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setForm(f => ({...f, role: r.val}))}
                    className={`flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wide transition-all ${
                      form.role === r.val
                        ? r.val === 'admin' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-800 border-slate-800 text-white'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {r.icon}{r.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Password */}
            <Field
              label={mode === 'edit' ? 'New Password (leave blank to keep)' : 'Password · கடவுச்சொல்'}
              error={passErr}
            >
              <div className="relative">
                <input
                  className={`text-input pr-10 ${passErr ? 'border-rose-300' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={field('password')}
                  onBlur={() => setTouched(t => ({...t, password: true}))}
                  placeholder={mode === 'edit' ? 'Leave blank to keep current' : '••••••••'}
                  required={mode === 'create'}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {form.password && <PasswordStrength password={form.password} />}
            </Field>

            {/* Confirm Password */}
            {(mode === 'create' || form.password) && (
              <Field label="Confirm Password · உறுதிப்படுத்து" error={confirmErr}>
                <input
                  className={`text-input ${confirmErr ? 'border-rose-300' : form.confirmPassword && !confirmErr ? 'border-emerald-300' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={field('confirmPassword')}
                  onBlur={() => setTouched(t => ({...t, confirmPassword: true}))}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Passwords match</p>
                )}
              </Field>
            )}

            {error   && <div className="ap-error">{error}</div>}
            {success && <div className="ap-success">{success}</div>}

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
              style={{ marginTop: '1rem', opacity: canSubmit ? 1 : 0.6 }}
            >
              {saving
                ? (mode === 'create' ? 'Creating…' : 'Saving…')
                : (mode === 'create' ? 'Create User' : 'Save Changes')}
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700 block mb-1">Security Notes:</strong>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Passwords require strength score of Fair or above</li>
              <li>Admin accounts cannot be disabled</li>
              <li>Usernames are case-insensitive, unique system-wide</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
