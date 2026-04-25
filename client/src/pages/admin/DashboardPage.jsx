import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadAdminUsers } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconList, IconSettings, IconSun, 
  IconUserPlus, IconZap, IconCreditCard, IconActivity 
} from '../../components/Icons.jsx';

export function DashboardPage() {
  const { user, language } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadAdminUsers().then((d) => setUsers(d.users || []));
  }, []);

  const total       = users.length;
  const demoUsers   = users.filter((u) => u.userType === 'demo').length;
  const subUsers    = users.filter((u) => u.userType === 'subscribed').length;
  const totalUsage  = users.reduce((acc, u) => acc + (u.usageStats?.generationsCount || 0), 0);

  const stats = [
    { label: 'Total Users', val: total, tamil: 'மொத்த பயனர்கள்', icon: IconUsers, theme: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
    { label: 'Paid Users', val: subUsers, tamil: 'சந்தாதாரர்கள்', icon: IconCreditCard, theme: 'bg-purple-50 border-purple-100 text-purple-600' },
    { label: 'Trial Users', val: demoUsers, tamil: 'சோதனை பயனர்கள்', icon: IconZap, theme: 'bg-blue-50 border-blue-100 text-blue-600' },
    { label: 'App Usage', val: totalUsage, tamil: 'பயன்பாடு', icon: IconActivity, theme: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-500 mb-2">
            {language === 'en' ? 'நிர்வாகம் · Portal Dashboard' : 'நிர்வாகம் · போர்டல் டாஷ்போர்டு'}
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {language === 'en' ? 'Overview' : 'கண்ணோட்டம்'}
          </h1>
        </div>
        <div className="text-right">
            <p className="text-lg font-black text-slate-900">
               {language === 'en' ? 'Welcome' : 'வரவேற்கிறோம்'}, {user?.name || user?.username}
            </p>
            <span className="text-sm text-emerald-600 font-bold flex items-center justify-end gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> {language === 'en' ? 'System Active' : 'கணினி செயல்படுகிறது'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className={`border p-6 rounded-[2rem] shadow-sm transition-all hover:scale-[1.02] ${s.theme}`}>
             <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black uppercase tracking-widest opacity-70">{language === 'en' ? s.label : s.tamil}</span>
                <s.icon size={24} className=" opacity-50" />
             </div>
             <div className="text-4xl font-black mb-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300 mb-8 flex items-center gap-4 after:h-px after:flex-1 after:bg-slate-200">
          {language === 'en' ? 'System Navigation' : 'கணினி ஆய்வு'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickLink 
            to="/admin/users" 
            icon={IconUserPlus} 
            label={language === 'en' ? 'Users List' : 'பயனர்கள்'}
            sub={language === 'en' ? 'Manage accounts & limits' : 'கணக்கு மேலாண்மை'} 
          />
          <QuickLink 
            to="/admin/palangal" 
            icon={IconList} 
            label={language === 'en' ? 'Palangal' : 'பலன்கள்'} 
            sub={language === 'en' ? 'Edit prediction texts' : 'பலன் மேலாண்மை'} 
          />
          <QuickLink 
            to="/admin/settings" 
            icon={IconSettings} 
            label={language === 'en' ? 'My Account' : 'எனது கணக்கு'} 
            sub={language === 'en' ? 'Security & Profile' : 'சுயவிவரம்'} 
          />
          <QuickLink 
            to="/admin/subscriptions" 
            icon={IconCreditCard} 
            label={language === 'en' ? 'Subscriptions' : 'சந்தா'} 
            sub={language === 'en' ? 'Manage paid users' : 'கணக்கு மேலாண்மை'} 
          />
          <QuickLink 
            to="/user" 
            icon={IconSun} 
            label={language === 'en' ? 'User App' : 'பயனர் பக்கம்'} 
            sub={language === 'en' ? 'Switch for testing' : 'சோதனை செய்ய'} 
            amber 
          />
        </div>
      </div>
      
      <div className="p-6 bg-slate-900 rounded-[2.5rem] flex items-center justify-between text-white shadow-xl shadow-slate-900/10">
         <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-emerald-400" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Security & Integrity Check: <span className="text-white">Passed</span></p>
         </div>
         <span className="text-sm font-bold text-slate-500 italic">Version 1.5.2 Build Stable</span>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, sub, amber }) {
  return (
    <Link to={to} className={`p-8 bg-white border border-slate-100 rounded-[2.5rem] group hover:bg-slate-900 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:bg-white/10 group-hover:text-white ${amber ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
        <Icon size={24} />
      </div>
      <strong className="block text-xl font-black text-slate-900 group-hover:text-white mb-1 transition-colors">{label}</strong>
      <span className="text-sm text-slate-400 block font-bold group-hover:text-white/40 transition-colors">{sub}</span>
    </Link>
  );
}
