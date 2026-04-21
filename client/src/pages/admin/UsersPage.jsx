import { useEffect, useState } from 'react';
import { loadAdminUsers, createAdminUser, updateAdminUser } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUserPlus, IconCheck, IconX, IconClock, 
  IconShield, IconCreditCard, IconHistory
} from '../../components/Icons.jsx';

function Field({ label, error, children, language }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
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
    subscriptionConfig: { ...DEFAULT_SUB_CONFIG }
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
      subscriptionConfig: u.subscriptionConfig || { ...DEFAULT_SUB_CONFIG }
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
        subscriptionConfig: { ...DEFAULT_SUB_CONFIG }
      });
      fetchUsers();
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setSaving(false);
    }
  }

  const T_HEAD = language === 'en' ? 'ஊழியர்கள் · User Management' : 'பயனர் மேலாண்மை';
  const T_TITLE = language === 'en' ? 'Users & Access' : 'பயனர்கள் மற்றும் அனுமதி';
  const T_NEW_U = language === 'en' ? 'Register New User' : 'புதிய பயனரை பதிவு செய்';
  const T_EDIT_U = language === 'en' ? 'Update User Access' : 'அனுமதியை மாற்றியமைக்கவும்';

  return (
    <div className="admin-page">
      <div className="admin-page-header mb-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 mb-2">{T_HEAD}</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">{T_TITLE}</h1>
        </div>
      </div>

      <div className="flex flex-row gap-8 items-start h-[calc(100vh-200px)]">
        
        {/* User List Table */}
        <div className="flex-1 min-w-0 ap-card overflow-hidden flex flex-col bg-white border border-slate-100">
           <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'en' ? 'User Identity' : 'பயனர் விவரம்'}</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'en' ? 'Tier' : 'வகை'}</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{language === 'en' ? 'Status' : 'நிலை'}</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{language === 'en' ? 'Controls' : 'நிர்வாகம்'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-base">{u.name[0]}</div>
                          <div className="flex flex-col">
                            <span className="text-base font-black text-slate-900">{u.name}</span>
                            <span className="text-xs font-bold text-slate-400">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.userType === 'demo' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-black uppercase">
                            <IconClock size={12} /> {language === 'en' ? 'Trial' : 'சோதனை'}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase">
                            <IconCreditCard size={12} /> {language === 'en' ? 'Paid' : 'கட்டணம்'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.active !== false ? (
                           <span className="flex items-center gap-1.5 text-emerald-500 text-sm font-black uppercase whitespace-nowrap"><IconCheck size={14}/> {language === 'en' ? 'Active' : 'இயக்கத்தில்'}</span>
                        ) : (
                           <span className="flex items-center gap-1.5 text-slate-300 text-sm font-black uppercase whitespace-nowrap"><IconX size={14}/> {language === 'en' ? 'Suspended' : 'நிறுத்தப்பட்டது'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewingUsage(u)} className="p-2.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100 transition-all"><IconHistory size={18}/></button>
                            <button onClick={() => handleEdit(u)} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black uppercase rounded-lg shadow-lg shadow-slate-900/10 hover:bg-black transition-all">{language === 'en' ? 'Edit' : 'மாற்று'}</button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        {/* User Form Panel */}
        <div className="w-96 shrink-0 ap-card p-8 bg-white border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-900">{mode === 'create' ? T_NEW_U : T_EDIT_U}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1.5">{language === 'en' ? 'Configuration & Permissions' : 'அனுமதி மற்றும் கட்டமைப்பு'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <Field label={language === 'en' ? "Username" : "பயனர் பெயர்"} error={errors.username}>
                <input className="text-input h-11 px-4 text-sm" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="dheena" required />
              </Field>
              <Field label={language === 'en' ? "Display Name" : "பெயர்"} error={errors.name}>
                <input className="text-input h-11 px-4 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dheena" required />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'demo' }))}
                className={`py-3 rounded-xl border-2 text-sm font-black uppercase transition-all ${form.userType === 'demo' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                {language === 'en' ? 'Trial User' : 'சோதனை பயனர்'}
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, userType: 'subscribed' }))}
                className={`py-3 rounded-xl border-2 text-sm font-black uppercase transition-all ${form.userType === 'subscribed' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                {language === 'en' ? 'Paid User' : 'கட்டண பயனர்'}
              </button>
            </div>

            {form.userType === 'demo' ? (
              <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100/50 space-y-5">
                <Field label={language === 'en' ? "Trial Expiry Date" : "சோதனை முடிவு நாள்"}>
                   <input type="date" className="text-input h-11 px-4 text-sm" value={form.demoConfig.trialEndDate} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, trialEndDate: e.target.value}})} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={language === 'en' ? "Max Generations" : "அதிகபட்ச கணக்கீடு"}>
                    <input type="number" className="text-input h-11 px-4 text-sm" value={form.demoConfig.maxGenerations} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, maxGenerations: Number(e.target.value)}})} />
                  </Field>
                  <Field label={language === 'en' ? "Max Nalla Neram" : "அதிகபட்ச நல்ல நேரம்"}>
                    <input type="number" className="text-input h-11 px-4 text-sm" value={form.demoConfig.maxNallaNeram} onChange={e => setForm({...form, demoConfig: {...form.demoConfig, maxNallaNeram: Number(e.target.value)}})} />
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
              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100/50 space-y-4">
                 <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600/60 ml-1">{language === 'en' ? 'Assigned Features' : 'அனுமதிக்கப்பட்ட பக்கம்'}</p>
                 <div className="flex flex-wrap gap-2">
                    {['panchaPakshi', 'nallaNeram', 'download'].map(f => (
                      <button key={f} type="button" 
                        onClick={() => {
                          const list = form.subscriptionConfig.features;
                          const updated = list.includes(f) ? list.filter(x => x !== f) : [...list, f];
                          setForm({...form, subscriptionConfig: {...form.subscriptionConfig, features: updated}});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase border transition-all ${form.subscriptionConfig.features.includes(f) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-emerald-200 text-emerald-400'}`}>
                        {f === 'panchaPakshi' ? 'Pancha Pakshi' : f === 'nallaNeram' ? 'Nalla Neram' : 'Downloads'}
                      </button>
                    ))}
                 </div>
              </div>
            )}

            <Field label={language === 'en' ? (mode === 'create' ? 'Password' : 'Reset Password') : (mode === 'create' ? 'கடவுச்சொல்' : 'புதிய கடவுச்சொல்')}>
               <input type="password" className="text-input h-10 px-4" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
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

        {/* Location History Modal */}
        {viewingUsage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{viewingUsage.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{language === 'en' ? 'Activity Timeline' : 'செயல்பாட்டு வரலாறு'}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">{viewingUsage.name[0]}</div>
              </div>
              <div className="p-8 flex-1 overflow-y-auto space-y-6">
                {(viewingUsage.locationHistory || []).length === 0 ? (
                  <p className="text-center py-12 text-slate-300 font-black uppercase tracking-widest text-xs">{language === 'en' ? 'No history available' : 'வரலாறு இல்லை'}</p>
                ) : (
                  viewingUsage.locationHistory.map((h, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-slate-200 mt-2" />
                        <div className="w-px flex-1 bg-slate-100 min-h-[40px]" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">{h.location}</div>
                        <div className="text-xs font-bold text-slate-400">{new Date(h.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-8 pt-0">
                <button onClick={() => setViewingUsage(null)} className="w-full py-5 bg-slate-900 text-white text-sm font-black uppercase rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
                  {language === 'en' ? 'Close' : 'மூடவும்'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
