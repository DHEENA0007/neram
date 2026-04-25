import { useEffect, useState } from 'react';
import { loadAdminUsers, updateAdminUser } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconCheck, IconX, IconCreditCard, IconCalendar, 
  IconPlus, IconSearch, IconFilter, IconChevronRight,
  IconArrowRight
} from '../../components/Icons.jsx';

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{label}</label>
      {children}
    </div>
  );
}

export function SubscriptionsPage() {
  const { language } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await loadAdminUsers();
      // Filter only subscribed users
      setUsers((data.users || []).filter(u => u.userType === 'subscribed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminUser(editingUser.id, {
        subscriptionConfig: editingUser.subscriptionConfig
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => !u.subscriptionConfig?.endDate || new Date(u.subscriptionConfig.endDate) > new Date()).length,
    expired: users.filter(u => u.subscriptionConfig?.endDate && new Date(u.subscriptionConfig.endDate) <= new Date()).length,
  };

  const T_TITLE = language === 'en' ? 'Subscription Control' : 'சந்தா கட்டுப்பாடு';
  const T_SUBTITLE = language === 'en' ? 'Manage paid access and licenses' : 'கட்டண அனுமதி மற்றும் சந்தாக்களை நிர்வகிக்கவும்';

  return (
    <div className="admin-page">
      <div className="admin-page-header mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">
            {language === 'en' ? 'Economy & Billing' : 'பொருளாதாரம் மற்றும் பில்லிங்'}
          </p>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">{T_TITLE}</h1>
          <p className="text-slate-400 font-medium mt-2 text-lg">{T_SUBTITLE}</p>
        </div>

        <div className="flex gap-4">
          <StatCard label="Active" value={stats.active} color="emerald" language={language} />
          <StatCard label="Expired" value={stats.expired} color="rose" language={language} />
          <StatCard label="Total" value={stats.total} color="slate" language={language} />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Search and Filters */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder={language === 'en' ? "Search subscribers..." : "சந்தாதாரர்களைத் தேடுங்கள்..."}
              className="w-full bg-slate-50/50 border-none outline-none pl-16 pr-6 py-4 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:bg-white focus:ring-2 focus:ring-amber-500/10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* User List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredUsers.map(u => {
            const isExpired = u.subscriptionConfig?.endDate && new Date(u.subscriptionConfig.endDate) <= new Date();
            return (
              <div key={u.id} className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:border-amber-200 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                      {u.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{u.name}</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">@{u.username}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {isExpired ? (language === 'en' ? 'Expired' : 'முடிந்தது') : (language === 'en' ? 'Active' : 'இயக்கத்தில்')}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{language === 'en' ? 'Plan' : 'திட்டம்'}</p>
                    <p className="text-sm font-black text-slate-900 uppercase">{(u.subscriptionConfig?.plan || 'pro')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{language === 'en' ? 'Validity' : 'காலாவதி'}</p>
                    <p className="text-sm font-black text-slate-900">
                      {u.subscriptionConfig?.endDate 
                        ? new Date(u.subscriptionConfig.endDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ta-IN', { dateStyle: 'long' })
                        : 'Unlimited'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                   <div className="flex flex-wrap gap-1.5">
                      {(u.subscriptionConfig?.features || []).map(f => (
                        <span key={f} className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider">{f}</span>
                      ))}
                   </div>
                   <button 
                    onClick={() => setEditingUser({ ...u })}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-colors"
                   >
                     {language === 'en' ? 'Manage' : 'நிர்வகி'} <IconChevronRight size={16} />
                   </button>
                </div>
              </div>
            );
          })}
        </div>

        {loading && users.length === 0 && (
          <div className="py-24 text-center">
            <span className="inline-block w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Subscribers...</p>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
            <IconCreditCard size={48} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-2xl font-black text-slate-300">{language === 'en' ? 'No Subscribers Found' : 'சந்தாதாரர்கள் இல்லை'}</h3>
          </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
           <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-4xl font-black text-slate-900">{editingUser.name}</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <IconCreditCard size={12} />
                    {language === 'en' ? 'License Configuration' : 'உரிம மேலாண்மை'}
                  </p>
                </div>
                <button onClick={() => setEditingUser(null)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <IconX size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
                
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Subscription Plan">
                    <select 
                      className="text-input h-14 px-5 text-sm font-bold"
                      value={editingUser.subscriptionConfig?.plan || 'pro'}
                      onChange={e => setEditingUser({
                        ...editingUser,
                        subscriptionConfig: { ...editingUser.subscriptionConfig, plan: e.target.value }
                      })}
                    >
                      <option value="basic">Basic</option>
                      <option value="pro">Professional</option>
                      <option value="premium">Premium</option>
                    </select>
                  </Field>

                  <Field label="Expiry Date">
                    <input 
                      type="date"
                      className="text-input h-14 px-5 text-sm font-bold"
                      value={editingUser.subscriptionConfig?.endDate?.split('T')[0] || ''}
                      onChange={e => setEditingUser({
                        ...editingUser,
                        subscriptionConfig: { ...editingUser.subscriptionConfig, endDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                      })}
                    />
                  </Field>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Feature Entitlements</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['panchaPakshi', 'nallaNeram', 'download'].map(f => {
                       const active = editingUser.subscriptionConfig?.features?.includes(f);
                       return (
                         <button 
                          key={f}
                          type="button"
                          onClick={() => {
                            const list = editingUser.subscriptionConfig?.features || [];
                            const updated = active ? list.filter(x => x !== f) : [...list, f];
                            setEditingUser({
                              ...editingUser,
                              subscriptionConfig: { ...editingUser.subscriptionConfig, features: updated }
                            });
                          }}
                          className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${active ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-lg shadow-amber-500/5' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                         >
                           <span className="text-xs font-black uppercase tracking-widest">{f === 'panchaPakshi' ? 'Pancha Pakshi' : f === 'nallaNeram' ? 'Nalla Neram' : 'Downloads'}</span>
                           <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-amber-500 text-white' : 'bg-slate-200 text-transparent'}`}>
                             <IconCheck size={12} />
                           </div>
                         </button>
                       );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                      <IconCalendar size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Automatic Renewal</p>
                      <p className="text-xs font-bold text-slate-900">Subscriptions do not renew automatically in this version.</p>
                   </div>
                </div>

              </form>

              <div className="p-10 bg-slate-50/50 border-t border-slate-50">
                <button 
                  type="submit"
                  disabled={saving}
                  onClick={handleSave}
                  className="w-full py-6 bg-slate-900 text-white text-sm font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {saving ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {language === 'en' ? 'Update Subscription' : 'சந்தாவைப் புதுப்பி'}
                      <IconArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, language }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-white text-slate-900 border-slate-100',
  };
  
  return (
    <div className={`px-6 py-4 rounded-[2rem] border ${colors[color]} min-w-[120px] shadow-sm`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
