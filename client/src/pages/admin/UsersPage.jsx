import { useEffect, useState } from 'react';
import { loadAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, approveDownloadRequest } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUserPlus, IconCheck, IconX, IconClock, 
  IconShield, IconCreditCard, IconHistory, IconTrash
} from '../../components/Icons.jsx';

function Field({ label, error, children, language }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 leading-none">{label}</label>
      {children}
      {error && <p className="text-[9px] text-rose-500 font-medium ml-1">⚠ {error}</p>}
    </div>
  );
}

const DEFAULT_DEMO_CONFIG = { trialEndDate: '', maxGenerations: 5, maxNallaNeram: 10, maxDownloads: 0, features: ['panchaPakshi', 'nallaNeram'] };
const DEFAULT_SUB_CONFIG = { subscriptionType: 'pro', endDate: '', features: ['panchaPakshi', 'nallaNeram', 'download'] };

export function UsersPage() {
  const { language } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [mode, setMode]       = useState('create');
  
  const [form, setForm] = useState({
    username: '', name: '', password: '', role: 'user', userType: 'demo', active: true,
    watermarkEnabled: true,
    demoConfig: { ...DEFAULT_DEMO_CONFIG },
    subscriptionConfig: { ...DEFAULT_SUB_CONFIG },
    downloadPermissions: {
      neram: { allowed: false, limit: 0, used: 0, requestStatus: 'none' },
      nalaneram: { allowed: false, limit: 0, used: 0, requestStatus: 'none' }
    }
  });
  
  const [errors, setErrors] = useState({});
  const [viewingUsage, setViewingUsage] = useState(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await loadAdminUsers();
      setUsers(data.users || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  function handleEdit(u) {
    setMode('edit');
    setForm({
      id: u.id, username: u.username, name: u.name, password: '', role: u.role || 'user', userType: u.userType || 'demo', active: u.active !== false,
      watermarkEnabled: u.watermarkEnabled !== false,
      demoConfig: u.demoConfig || { ...DEFAULT_DEMO_CONFIG },
      subscriptionConfig: u.subscriptionConfig || { ...DEFAULT_SUB_CONFIG },
      branding: u.branding || { customEnabled: false, requestStatus: 'none' },
      downloadPermissions: u.downloadPermissions || {
        neram: { allowed: false, limit: 0, used: 0, requestStatus: 'none' },
        nalaneram: { allowed: false, limit: 0, used: 0, requestStatus: 'none' }
      }
    });
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === 'create') await createAdminUser(form);
      else await updateAdminUser(form.id, form);
      setMode('create');
      setForm({
        username: '', name: '', password: '', role: 'user', userType: 'demo', active: true,
        watermarkEnabled: true,
        demoConfig: { ...DEFAULT_DEMO_CONFIG },
        subscriptionConfig: { ...DEFAULT_SUB_CONFIG }
      });
      fetchUsers();
    } catch (err) { setErrors({ server: err.message }); }
    finally { setSaving(false); }
  }

  const handleDelete = async (u) => {
    if (u.role === 'admin') return;
    if (window.confirm('Delete user?')) {
      await deleteAdminUser(u.id);
      fetchUsers();
    }
  };

  const [approvingKey, setApprovingKey] = useState(null);

  async function handleApprove(userId, service, approve) {
    setApprovingKey(`${userId}-${service}`);
    try {
      await approveDownloadRequest(userId, service, approve);
      fetchUsers();
    } finally {
      setApprovingKey(null);
    }
  }

  // Collect all pending download requests across all users
  const pendingRequests = users.flatMap(u =>
    ['neram', 'nalaneram'].flatMap(svc => {
      const dp = u.downloadPermissions?.[svc];
      if (dp?.requestStatus === 'pending') {
        return [{ user: u, service: svc }];
      }
      return [];
    })
  );

  return (
    <div className="admin-page space-y-4 pb-16">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start h-[calc(100vh-160px)]">
        <div className="flex-1 w-full min-w-0 flex flex-col gap-4 h-full overflow-hidden">

          {/* ── Pending Download Requests ── */}
          {pendingRequests.length > 0 && (
            <div className="bg-white border border-amber-100 rounded-xl shadow-sm overflow-hidden shrink-0">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-50 bg-amber-50/60">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Pending PDF Download Requests
                </p>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                  {pendingRequests.length}
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {pendingRequests.map(({ user: u, service }) => {
                  const label = service === 'nalaneram' ? 'Nalla Neram PDF' : 'Pancha Pakshi PDF';
                  const key = `${u.id}-${service}`;
                  const busy = approvingKey === key;
                  return (
                    <div key={key} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px] shrink-0">
                        {u.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[9px] text-slate-400">@{u.username} · <span className="text-amber-600 font-semibold">{label}</span></p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          disabled={busy}
                          onClick={() => handleApprove(u.id, service, true)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase disabled:opacity-40 transition-all"
                        >
                          <IconCheck size={12} /> Approve
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => handleApprove(u.id, service, false)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 text-[10px] font-bold uppercase disabled:opacity-40 transition-all"
                        >
                          <IconX size={12} /> Deny
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Users Table ── */}
          <div className="flex-1 bg-white border border-slate-100 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
           <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tier</th>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => {
                    const hasPending = ['neram', 'nalaneram'].some(
                      s => u.downloadPermissions?.[s]?.requestStatus === 'pending'
                    );
                    return (
                    <tr key={u.id} className="hover:bg-slate-50/50 group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px] relative">
                            {u.name[0]}
                            {hasPending && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">{u.name}</span>
                            <span className="text-[9px] font-medium text-slate-400">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase ${u.userType === 'demo' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewingUsage(u)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900"><IconHistory size={16}/></button>
                            <button onClick={() => handleEdit(u)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-500"><IconShield size={16}/></button>
                            <button onClick={() => handleDelete(u)} className={`p-1.5 rounded ${u.role === 'admin' ? 'opacity-10' : 'text-slate-400 hover:text-rose-500'}`}><IconTrash size={16}/></button>
                         </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
          </div>
        </div>

        <div className="w-full lg:w-[350px] shrink-0 bg-white border border-slate-100 rounded-xl p-6 flex flex-col h-full overflow-hidden shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">{mode === 'create' ? 'Add User' : 'Edit User'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* ── Basic Info ── */}
            <Field label="Username" error={errors.username}>
              <input className="text-input h-10 px-3 text-xs border-slate-200" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            </Field>
            <Field label="Name">
              <input className="text-input h-10 px-3 text-xs border-slate-200" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </Field>
            <Field label={mode === 'edit' ? 'Password (leave blank to keep)' : 'Password'}>
              <input type="password" className="text-input h-10 px-3 text-xs border-slate-200" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={mode === 'create'} />
            </Field>

            {/* ── User Type ── */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">User Type</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'demo' }))} className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase border transition-all ${form.userType === 'demo' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>Trial</button>
                <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'subscribed' }))} className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase border transition-all ${form.userType === 'subscribed' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>Paid</button>
              </div>
            </div>

            {/* ── Trial Config ── */}
            {form.userType === 'demo' && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Trial Settings</p>
                <Field label="Trial End Date">
                  <input type="date" className="text-input h-9 px-3 text-xs border-slate-200" value={form.demoConfig?.trialEndDate || ''} onChange={e => setForm(f => ({ ...f, demoConfig: { ...f.demoConfig, trialEndDate: e.target.value } }))} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Max Generations">
                    <input type="number" min={0} className="text-input h-9 px-3 text-xs border-slate-200" value={form.demoConfig?.maxGenerations ?? 5} onChange={e => setForm(f => ({ ...f, demoConfig: { ...f.demoConfig, maxGenerations: Number(e.target.value) } }))} />
                  </Field>
                  <Field label="Max Nalla Neram">
                    <input type="number" min={0} className="text-input h-9 px-3 text-xs border-slate-200" value={form.demoConfig?.maxNallaNeram ?? 10} onChange={e => setForm(f => ({ ...f, demoConfig: { ...f.demoConfig, maxNallaNeram: Number(e.target.value) } }))} />
                  </Field>
                </div>
                <Field label="Max Downloads">
                  <input type="number" min={0} className="text-input h-9 px-3 text-xs border-slate-200" value={form.demoConfig?.maxDownloads ?? 0} onChange={e => setForm(f => ({ ...f, demoConfig: { ...f.demoConfig, maxDownloads: Number(e.target.value) } }))} />
                </Field>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Features</p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'panchaPakshi', label: 'Pancha Pakshi' },
                      { key: 'nallaNeram',   label: 'Nalla Neram' },
                      { key: 'download',     label: 'Download / PDF' },
                    ].map(f => {
                      const on = (form.demoConfig?.features || []).includes(f.key);
                      return (
                        <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={on} onChange={() => setForm(fm => {
                            const feats = fm.demoConfig?.features || [];
                            return { ...fm, demoConfig: { ...fm.demoConfig, features: on ? feats.filter(x => x !== f.key) : [...feats, f.key] } };
                          })} className="w-3.5 h-3.5 accent-amber-500" />
                          <span className="text-[11px] font-medium text-slate-700">{f.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Subscription Config ── */}
            {form.userType === 'subscribed' && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Subscription Settings</p>
                <Field label="Subscription End Date">
                  <input type="date" className="text-input h-9 px-3 text-xs border-slate-200" value={form.subscriptionConfig?.endDate || ''} onChange={e => setForm(f => ({ ...f, subscriptionConfig: { ...f.subscriptionConfig, endDate: e.target.value } }))} />
                </Field>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Features</p>
                  <div className="space-y-1.5">
                    {[
                      { key: 'panchaPakshi', label: 'Pancha Pakshi' },
                      { key: 'nallaNeram',   label: 'Nalla Neram' },
                      { key: 'download',     label: 'Download / PDF' },
                    ].map(f => {
                      const on = (form.subscriptionConfig?.features || []).includes(f.key);
                      return (
                        <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={on} onChange={() => setForm(fm => {
                            const feats = fm.subscriptionConfig?.features || [];
                            return { ...fm, subscriptionConfig: { ...fm.subscriptionConfig, features: on ? feats.filter(x => x !== f.key) : [...feats, f.key] } };
                          })} className="w-3.5 h-3.5 accent-emerald-500" />
                          <span className="text-[11px] font-medium text-slate-700">{f.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Download Permissions ── */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Download Permissions</p>
              {[
                { key: 'neram',     label: 'Pancha Pakshi PDF' },
                { key: 'nalaneram', label: 'Nalla Neram PDF' },
              ].map(({ key, label }) => {
                const dp = form.downloadPermissions?.[key] || { allowed: false, limit: 0 };
                return (
                  <div key={key} className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={dp.allowed} onChange={() => setForm(f => ({
                        ...f,
                        downloadPermissions: { ...f.downloadPermissions, [key]: { ...dp, allowed: !dp.allowed } }
                      }))} className="w-3.5 h-3.5 accent-slate-700" />
                      <span className="text-[11px] font-bold text-slate-700">{label}</span>
                    </label>
                    {dp.allowed && (
                      <div className="ml-5">
                        <Field label="Download Limit (0 = unlimited)">
                          <input type="number" min={0} className="text-input h-8 px-3 text-xs border-slate-200" value={dp.limit ?? 0} onChange={e => setForm(f => ({
                            ...f,
                            downloadPermissions: { ...f.downloadPermissions, [key]: { ...dp, limit: Number(e.target.value) } }
                          }))} />
                        </Field>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Watermark toggle ── */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">PDF Watermark</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Sivagayan Astro watermark on downloads</div>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, watermarkEnabled: !f.watermarkEnabled }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.watermarkEnabled ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.watermarkEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <button type="submit" disabled={saving} className="w-full py-3 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-amber-600 transition-all">
              {saving ? '...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>

            {errors.server && <p className="p-2 bg-rose-50 text-rose-500 text-[9px] font-bold rounded">⚠ {errors.server}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
