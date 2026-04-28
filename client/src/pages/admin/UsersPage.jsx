import { useEffect, useState } from 'react';
import { loadAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUserPlus, IconCheck, IconX, IconClock, 
  IconShield, IconCreditCard, IconHistory, IconTrash
} from '../../components/Icons.jsx';

function Field({ label, error, children, language }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 ml-1 leading-none">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-500 font-medium ml-1">⚠ {error}</p>}
    </div>
  );
}

const DEFAULT_DEMO_CONFIG = {
  trialEndDate: '',
  maxGenerations: 5,
  maxNallaNeram: 10,
  maxDownloads: 0,
  features: ['panchaPakshi', 'nallaNeram']
};

const DEFAULT_SUB_CONFIG = {
  subscriptionType: 'pro',
  endDate: '',
  features: ['panchaPakshi', 'nallaNeram', 'download']
};

export function UsersPage() {
  const { language } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [mode, setMode]       = useState('create');
  
  const [form, setForm] = useState({
    username: '',
    name: '',
    password: '',
    role: 'user',
    userType: 'demo',
    active: true,
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  function handleEdit(u) {
    setMode('edit');
    setForm({
      id: u.id,
      username: u.username,
      name: u.name,
      password: '',
      role: u.role || 'user',
      userType: u.userType || 'demo',
      active: u.active !== false,
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
    setErrors({});
    setSaving(true);
    try {
      if (mode === 'create') {
        await createAdminUser(form);
      } else {
        await updateAdminUser(form.id, form);
      }
      setMode('create');
      setForm({
        username: '', name: '', password: '', role: 'user', userType: 'demo', active: true,
        demoConfig: { ...DEFAULT_DEMO_CONFIG },
        subscriptionConfig: { ...DEFAULT_SUB_CONFIG },
        branding: { customEnabled: false, requestStatus: 'none' }
      });
      fetchUsers();
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    if (u.role === 'admin') {
      alert(language === 'en' ? 'Admin users cannot be deleted.' : 'நிர்வாக பயனர்களை நீக்க முடியாது.');
      return;
    }
    const msg = language === 'en' 
      ? `Are you sure you want to delete ${u.name}? Access will be revoked immediately.` 
      : `${u.name} பயனரை நீக்க வேண்டுமா? அனைத்து அனுமதிகளும் உடனடியாக ரத்து செய்யப்படும்.`;
      
    if (window.confirm(msg)) {
      try {
        await deleteAdminUser(u.id);
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  }

  const T_HEAD = language === 'en' ? 'User Management' : 'பயனர் மேலாண்மை';
  const T_TITLE = language === 'en' ? 'Users & Access' : 'பயனர்கள் மற்றும் அனுமதி';
  const T_NEW_U = language === 'en' ? 'Register New User' : 'புதிய பயனரை பதிவு செய்';
  const T_EDIT_U = language === 'en' ? 'Update User Access' : 'அனுமதியை மாற்றியமைக்கவும்';

  return (
    <div className="admin-page space-y-6 pb-20">
      <div className="admin-page-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2">{T_HEAD}</p>
          <h1 className="text-4xl font-bold text-slate-900">{T_TITLE}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-180px)]">
        
        {/* User List Table */}
        <div className="flex-1 w-full min-w-0 bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-sm">
           <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'User' : 'பயனர்'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Tier' : 'வகை'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Status' : 'நிலை'}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">{language === 'en' ? 'Actions' : 'நிர்வாகம்'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">{u.name[0]}</div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{u.name}</span>
                              {(u.downloadPermissions?.neram?.requestStatus === 'pending' || u.downloadPermissions?.nalaneram?.requestStatus === 'pending') && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-slate-400">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.userType === 'demo' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-semibold uppercase">
                            <IconClock size={12} /> {language === 'en' ? 'Trial' : 'சோதனை'}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-semibold uppercase">
                            <IconCreditCard size={12} /> {language === 'en' ? 'Paid' : 'கட்டணம்'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.active !== false ? (
                           <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold uppercase"><IconCheck size={14}/> {language === 'en' ? 'Active' : 'இயக்கத்தில்'}</span>
                        ) : (
                           <span className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold uppercase"><IconX size={14}/> {language === 'en' ? 'Suspended' : 'நிறுத்தப்பட்டது'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewingUsage(u)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900"><IconHistory size={18}/></button>
                            <button onClick={() => handleEdit(u)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-500"><IconShield size={18}/></button>
                            <button 
                              onClick={() => handleDelete(u)} 
                              className={`p-2 rounded-lg ${u.role === 'admin' ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}
                            >
                              <IconTrash size={18}/>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        {/* User Form Panel */}
        <div className="w-full lg:w-[400px] shrink-0 bg-white border border-slate-100 rounded-2xl p-8 flex flex-col h-full overflow-hidden shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{mode === 'create' ? T_NEW_U : T_EDIT_U}</h2>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{language === 'en' ? 'Configuration & Permissions' : 'அனுமதி மற்றும் கட்டமைப்பு'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Field label={language === 'en' ? "Username" : "பயனர் பெயர்"} error={errors.username}>
                <input className="text-input h-12 px-4 shadow-none border-slate-200" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="dheena" required />
              </Field>
              <Field label={language === 'en' ? "Name" : "பெயர்"} error={errors.name}>
                <input className="text-input h-12 px-4 shadow-none border-slate-200" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dheena" required />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'demo' }))}
                className={`py-3 rounded-xl border text-[11px] font-bold uppercase transition-all ${form.userType === 'demo' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                {language === 'en' ? 'Trial' : 'சோதனை'}
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'subscribed' }))}
                className={`py-3 rounded-xl border text-[11px] font-bold uppercase transition-all ${form.userType === 'subscribed' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                {language === 'en' ? 'Paid' : 'கட்டணம்'}
              </button>
            </div>

            {form.userType === 'demo' ? (
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 space-y-4">
                <Field label={language === 'en' ? "Trial Expiry" : "சோதனை முடிவு"}>
                   <input type="date" className="text-input h-12 px-4 border-amber-100 bg-white" value={form.demoConfig.trialEndDate} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, trialEndDate: e.target.value}})} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Max Gen">
                    <input type="number" className="text-input h-12 px-4 border-amber-100 bg-white" value={form.demoConfig.maxGenerations} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, maxGenerations: Number(e.target.value)}})} />
                  </Field>
                  <Field label="Max Nalla">
                    <input type="number" className="text-input h-12 px-4 border-amber-100 bg-white" value={form.demoConfig.maxNallaNeram} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, maxNallaNeram: Number(e.target.value)}})} />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-4">
                 <Field label={language === 'en' ? "Plan Type" : "திட்ட வகை"}>
                   <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-emerald-100">
                      {['pro', 'enterprise'].map(t => (
                        <button key={t} type="button" onClick={() => setForm({...form, subscriptionConfig: {...form.subscriptionConfig, subscriptionType: t}})}
                          className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${form.subscriptionConfig.subscriptionType === t ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400'}`}>
                          {t}
                        </button>
                      ))}
                   </div>
                 </Field>
                 <Field label="Expiry Date">
                    <input type="date" className="text-input h-11 px-4 border-emerald-100 bg-white" value={form.subscriptionConfig.endDate || ''} onChange={e => setForm({...form, subscriptionConfig: {...form.subscriptionConfig, endDate: e.target.value}})} />
                 </Field>
              </div>
            )}

            <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-4">
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permissions</p>
               <div className="space-y-3">
                 {['neram', 'nalaneram'].map(service => {
                   const dp = form.downloadPermissions?.[service] || { allowed: false, limit: 0, used: 0, requestStatus: 'none' };
                   return (
                     <div key={service} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                       <span className="text-xs font-bold uppercase">{service}</span>
                       <button type="button" onClick={() => setForm({...form, downloadPermissions: {...form.downloadPermissions, [service]: {...dp, allowed: !dp.allowed}}})}
                          className={`w-10 h-5 rounded-full relative transition-colors ${dp.allowed ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${dp.allowed ? 'right-1' : 'left-1'}`} />
                       </button>
                     </div>
                   );
                 })}
               </div>
            </div>

            <Field label={mode === 'create' ? 'Password' : 'New Password'}>
               <input type="password" className="text-input h-12 px-4 border-slate-200" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
            </Field>

            <button type="submit" disabled={saving} className="w-full py-4 bg-amber-500 text-white text-xs font-bold uppercase rounded-xl shadow-md active:scale-95 transition-all">
              {saving ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </button>
            
            {mode === 'edit' && (
              <button type="button" onClick={() => setMode('create')} className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
                Cancel
              </button>
            )}
            
            {errors.server && <p className="p-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-[10px] font-bold">⚠ {errors.server}</p>}
          </form>
        </div>

        {viewingUsage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                <h3 className="text-2xl font-bold text-slate-900">{viewingUsage.name} Usage</h3>
                <button onClick={() => setViewingUsage(null)} className="text-slate-300 hover:text-rose-500 transition-colors"><IconX size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-600/70 uppercase mb-1">Total Hits</p>
                    <span className="text-3xl font-bold text-amber-700">{viewingUsage.usageStats?.generationsCount || 0}</span>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Last Used</p>
                    <p className="text-sm font-bold text-slate-700">{viewingUsage.usageStats?.lastUsedAt ? new Date(viewingUsage.usageStats.lastUsedAt).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Locations</p>
                   {Object.entries(viewingUsage.usageStats?.locationFrequency || {}).length === 0 ? <p className="text-xs italic text-slate-300">No data</p> : (
                     Object.entries(viewingUsage.usageStats?.locationFrequency || {}).sort(([,a], [,b]) => b - a).slice(0, 5).map(([loc, count], idx) => (
                       <div key={loc} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent">
                          <span className="text-xs font-bold text-slate-700">{idx+1}. {loc}</span>
                          <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400 uppercase">{count} Hits</span>
                       </div>
                     ))
                   )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-b-[2rem]">
                <button onClick={() => setViewingUsage(null)} className="w-full py-4 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl">Dismiss</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
