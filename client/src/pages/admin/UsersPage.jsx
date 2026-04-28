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
      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 leading-none">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-500 font-bold ml-1">⚠ {error}</p>}
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
    <div className="admin-page">
      <div className="admin-page-header mb-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 mb-2">{T_HEAD}</p>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">{T_TITLE}</h1>
        </div>
      </div>

      <div className="flex flex-row gap-8 items-start h-[calc(100vh-200px)]">
        
        {/* User List Table */}
        <div className="flex-1 min-w-0 ap-card overflow-hidden flex flex-col bg-white border border-slate-100">
           <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{language === 'en' ? 'User Identity' : 'பயனர் விவரம்'}</th>
                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{language === 'en' ? 'Tier' : 'வகை'}</th>
                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{language === 'en' ? 'Status' : 'நிலை'}</th>
                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-right">{language === 'en' ? 'Controls' : 'நிர்வாகம்'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xl">{u.name[0]}</div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-slate-900">{u.name}</span>
                              {(u.downloadPermissions?.neram?.requestStatus === 'pending' || u.downloadPermissions?.nalaneram?.requestStatus === 'pending') && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Pending download request" />
                              )}
                            </div>
                            <span className="text-sm font-bold text-slate-400">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {u.userType === 'demo' ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase">
                            <IconClock size={14} /> {language === 'en' ? 'Trial' : 'சோதனை'}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase">
                            <IconCreditCard size={14} /> {language === 'en' ? 'Paid' : 'கட்டணம்'}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {u.active !== false ? (
                           <span className="flex items-center gap-2 text-emerald-500 text-base font-black uppercase whitespace-nowrap"><IconCheck size={18}/> {language === 'en' ? 'Active' : 'இயக்கத்தில்'}</span>
                        ) : (
                           <span className="flex items-center gap-2 text-slate-300 text-base font-black uppercase whitespace-nowrap"><IconX size={18}/> {language === 'en' ? 'Suspended' : 'நிறுத்தப்பட்டது'}</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button onClick={() => setViewingUsage(u)} className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all" title="Usage Analytics"><IconHistory size={20}/></button>
                            <button onClick={() => handleEdit(u)} className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-amber-500 transition-all" title="Edit Access"><IconShield size={20}/></button>
                            <button 
                              onClick={() => handleDelete(u)} 
                              className={`p-3 rounded-xl transition-all ${u.role === 'admin' ? 'opacity-20 cursor-not-allowed text-slate-300' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}
                              title={u.role === 'admin' ? 'Protected Admin' : 'Delete User'}
                            >
                              <IconTrash size={20}/>
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
        <div className="w-[450px] shrink-0 ap-card p-10 bg-white border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-900">{mode === 'create' ? T_NEW_U : T_EDIT_U}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1.5">{language === 'en' ? 'Configuration & Permissions' : 'அனுமதி மற்றும் கட்டமைப்பு'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-5">
              <Field label={language === 'en' ? "Username" : "பயனர் பெயர்"} error={errors.username}>
                <input className="text-input h-14 px-5 text-base" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="dheena" required />
              </Field>
              <Field label={language === 'en' ? "Display Name" : "பெயர்"} error={errors.name}>
                <input className="text-input h-14 px-5 text-base" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dheena" required />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'demo' }))}
                className={`py-4 rounded-2xl border-2 text-base font-black uppercase transition-all ${form.userType === 'demo' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                {language === 'en' ? 'Trial User' : 'சோதனை பயனர்'}
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'subscribed' }))}
                className={`py-4 rounded-2xl border-2 text-base font-black uppercase transition-all ${form.userType === 'subscribed' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                {language === 'en' ? 'Paid User' : 'கட்டண பயனர்'}
              </button>
            </div>

            {form.userType === 'demo' ? (
              <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100/50 space-y-5">
                <Field label={language === 'en' ? "Trial Expiry Date" : "சோதனை முடிவு நாள்"}>
                   <input type="date" className="text-input h-14 px-5 text-base" value={form.demoConfig.trialEndDate} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, trialEndDate: e.target.value}})} />
                </Field>
                <div className="grid grid-cols-2 gap-5">
                  <Field label={language === 'en' ? "Max Generations" : "அதிகபட்ச கணக்கீடு"}>
                    <input type="number" className="text-input h-14 px-5 text-base" value={form.demoConfig.maxGenerations} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, maxGenerations: Number(e.target.value)}})} />
                  </Field>
                  <Field label={language === 'en' ? "Max Nalla Neram" : "அதிகபட்ச நல்ல நேரம்"}>
                    <input type="number" className="text-input h-14 px-5 text-base" value={form.demoConfig.maxNallaNeram} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, maxNallaNeram: Number(e.target.value)}})} />
                  </Field>
                </div>
                
                {/* Fixed Feature Toggles for Demo */}
                <div className="space-y-3">
                  <p className="text-sm font-black uppercase tracking-widest text-amber-600/60 ml-1">{language === 'en' ? 'Feature Access' : 'அனுமதிகள்'}</p>
                  <div className="flex gap-2">
                    {['panchaPakshi', 'nallaNeram'].map(f => (
                      <button key={f} type="button" 
                        onClick={() => {
                          const features = form.demoConfig.features || [];
                          const updated = features.includes(f) ? features.filter(x => x !== f) : [...features, f];
                          setForm({...form, demoConfig: {...form.demoConfig, features: updated}});
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-black uppercase border transition-all ${form.demoConfig.features?.includes(f) ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white border-amber-200 text-amber-400'}`}>
                        {f === 'panchaPakshi' ? 'Pancha Pakshi' : 'Nalla Neram'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100/50 space-y-6">
                 <div>
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600/60 ml-1 mb-4">{language === 'en' ? 'Subscription Details' : 'சந்தா விவரங்கள்'}</p>
                   <div className="grid grid-cols-1 gap-4">
                      <Field label={language === 'en' ? "Plan Type" : "திட்ட வகை"}>
                        <div className="flex bg-white p-1 rounded-xl border border-emerald-100">
                          {['pro', 'enterprise'].map(t => (
                            <button key={t} type="button" onClick={() => setForm({...form, subscriptionConfig: {...form.subscriptionConfig, subscriptionType: t}})}
                              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${form.subscriptionConfig.subscriptionType === t ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label={language === 'en' ? "Expiry Date" : "முடிவு நாள்"}>
                         <input type="date" className="text-input h-12 px-5 text-sm bg-white" value={form.subscriptionConfig.endDate || ''} onChange={e => setForm({...form, subscriptionConfig: {...form.subscriptionConfig, endDate: e.target.value}})} />
                         <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">Leave empty for lifetime access</p>
                      </Field>
                   </div>
                 </div>

                 <div>
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600/60 ml-1 mb-3">{language === 'en' ? 'Assigned Features' : 'அனுமதிக்கப்பட்ட பக்கம்'}</p>
                   <div className="flex flex-wrap gap-2">
                      {['panchaPakshi', 'nallaNeram', 'download'].map(f => (
                        <button key={f} type="button" 
                          onClick={() => {
                            const list = form.subscriptionConfig.features;
                            const updated = list.includes(f) ? list.filter(x => x !== f) : [...list, f];
                            setForm({...form, subscriptionConfig: {...form.subscriptionConfig, features: updated}});
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase border transition-all ${form.subscriptionConfig.features.includes(f) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-emerald-200 text-emerald-400'}`}>
                          {f === 'panchaPakshi' ? 'Pancha Pakshi' : f === 'nallaNeram' ? 'Nalla Neram' : 'Downloads'}
                        </button>
                      ))}
                   </div>
                 </div>
              </div>
            )}

            {/* Branding Management */}
            {form.userType === 'subscribed' && (
              <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100/50 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600/60 ml-1">{language === 'en' ? 'Branding Access' : 'பிராண்டிங் அனுமதி'}</p>
                  {form.branding?.requestStatus === 'pending' && <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Requested</span>}
                </div>
                
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setForm({...form, branding: {...(form.branding || {}), customEnabled: !form.branding?.customEnabled}})}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.branding?.customEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.branding?.customEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-xs font-bold text-slate-600">{language === 'en' ? 'Custom Branding Access' : 'தனிப்பயன் பிராண்டிங் அனுமதி'}</span>
                </div>

                {form.branding?.customEnabled && (
                  <div className="flex bg-white/50 p-1 rounded-xl">
                    {['pending', 'approved', 'rejected'].map(s => (
                      <button key={s} type="button" onClick={() => setForm({...form, branding: {...(form.branding || {}), requestStatus: s}})}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${form.branding?.requestStatus === s ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Download Permissions Management */}
            <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-6">
               <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{language === 'en' ? 'Download Permissions' : 'பதிவிறக்க அனுமதி'}</p>
               
               {['neram', 'nalaneram'].map(service => {
                 const dp = form.downloadPermissions?.[service] || { allowed: false, limit: 0, used: 0, requestStatus: 'none' };
                 return (
                   <div key={service} className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-black uppercase tracking-wider">{service}</span>
                         {dp.requestStatus === 'pending' && <span className="text-[9px] font-black bg-amber-500 px-2 py-0.5 rounded animate-pulse">Request Pending</span>}
                      </div>

                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setForm({...form, downloadPermissions: {...form.downloadPermissions, [service]: {...dp, allowed: !dp.allowed}}})}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${dp.allowed ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dp.allowed ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className="text-xs font-bold text-slate-300">{dp.allowed ? 'Granted' : 'Locked'}</span>
                      </div>

                      {dp.allowed && (
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limit</label>
                              <input type="number" className="bg-white/10 border border-white/10 rounded-lg h-10 px-3 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all" 
                                value={dp.limit} onChange={e => setForm({...form, downloadPermissions: {...form.downloadPermissions, [service]: {...dp, limit: Number(e.target.value)}}})} />
                           </div>
                           <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Used</label>
                              <div className="bg-slate-800 rounded-lg h-10 flex items-center px-4 text-xs font-black text-amber-500">
                                {dp.used} / {dp.limit || '∞'}
                              </div>
                           </div>
                        </div>
                      )}

                      {!dp.allowed && (
                        <div className="flex bg-white/5 p-1 rounded-lg">
                           {['none', 'approved', 'rejected'].map(s => (
                             <button key={s} type="button" onClick={() => setForm({...form, downloadPermissions: {...form.downloadPermissions, [service]: {...dp, requestStatus: s}}})}
                               className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase transition-all ${dp.requestStatus === s ? 'bg-white text-slate-900' : 'text-slate-500'}`}>
                               {s}
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>

            <Field label={language === 'en' ? (mode === 'create' ? 'Password' : 'Reset Password') : (mode === 'create' ? 'கடவுச்சொல்' : 'புதிய கடவுச்சொல்')}>
               <input type="password" className="text-input h-14 px-5 text-base" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
            </Field>

            <button type="submit" disabled={saving} className="w-full py-5 bg-amber-500 text-white text-sm font-black uppercase rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all">
              {saving ? '...' : mode === 'create' ? (language === 'en' ? 'Create User' : 'பயனரை உருவாக்கு') : (language === 'en' ? 'Update User' : 'மாற்றியமைக்கவும்')}
            </button>
            
            {mode === 'edit' && (
              <button type="button" onClick={() => {
                setMode('create');
                setForm({ username: '', name: '', password: '', role: 'user', userType: 'demo', active: true, demoConfig: {...DEFAULT_DEMO_CONFIG}, subscriptionConfig: {...DEFAULT_SUB_CONFIG} });
              }} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest py-2 active:scale-95 transition-all">
                {language === 'en' ? 'Cancel Editing' : 'விட்டுவிடவும்'}
              </button>
            )}
            
            {errors.server && <p className="p-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl text-xs font-bold">⚠ {errors.server}</p>}
          </form>
        </div>

        {/* Location History & Analytics Modal */}
        {viewingUsage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-4xl font-black text-slate-900 leading-tight">{viewingUsage.name}</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <IconHistory size={12} className="text-amber-500" />
                    {language === 'en' ? 'Usage Intelligence & History' : 'பயன்பாட்டு நுண்ணறிவு மற்றும் வரலாறு'}
                  </p>
                </div>
                <button onClick={() => setViewingUsage(null)} className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center hover:text-rose-500 hover:shadow-lg transition-all">
                  <IconX size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                
                {/* Analytics Summary */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100/50">
                    <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-2">{language === 'en' ? 'Engagement' : 'ஈடுபாடு'}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-amber-700">{viewingUsage.usageStats?.generationsCount || 0}</span>
                      <span className="text-xs font-bold text-amber-600/60">Total Hits</span>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'en' ? 'Last Activity' : 'கடைசி செயல்பாடு'}</p>
                    <p className="text-lg font-black">{viewingUsage.usageStats?.lastUsedAt ? new Date(viewingUsage.usageStats.lastUsedAt).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>

                {/* Major Search Locations */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                    {language === 'en' ? 'Major Search Locations' : 'முக்கிய தேடல் இடங்கள்'}
                    <div className="h-px flex-1 bg-slate-100" />
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(viewingUsage.usageStats?.locationFrequency || {})
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([loc, count], idx) => (
                        <div key={loc} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-amber-200 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-amber-500 shadow-sm">{idx + 1}</span>
                            <span className="font-bold text-slate-900">{loc}</span>
                          </div>
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">{count} {language === 'en' ? 'Searches' : 'தேடல்கள்'}</span>
                        </div>
                    ))}
                    {(!viewingUsage.usageStats?.locationFrequency || Object.keys(viewingUsage.usageStats.locationFrequency).length === 0) && (
                      <p className="text-center py-6 text-slate-300 italic text-sm">No location data available yet.</p>
                    )}
                  </div>
                </div>

                {/* Complete History Timeline */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                    {language === 'en' ? 'Activity Timeline' : 'செயல்பாட்டு காலவரிசை'}
                    <div className="h-px flex-1 bg-slate-100" />
                  </h4>
                  <div className="space-y-6 pl-4 border-l-2 border-slate-50">
                    {(viewingUsage.usageStats?.lastLocations || []).length === 0 ? (
                      <p className="text-center py-8 text-slate-300 font-black uppercase tracking-widest text-[10px] italic">{language === 'en' ? 'No recent activity' : 'சமீபத்திய செயல்பாடு இல்லை'}</p>
                    ) : (
                      viewingUsage.usageStats.lastLocations.map((h, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-100" />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-900 truncate max-w-[200px]">{h.name}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-black uppercase tracking-wider">{h.type || 'Search'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                              {new Date(h.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'ta-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <div className="p-10 bg-slate-50/50 border-t border-slate-50">
                <button onClick={() => setViewingUsage(null)} className="w-full py-6 bg-slate-900 text-white text-sm font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
                  {language === 'en' ? 'Dismiss Intelligence' : 'வெளியேறு'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
