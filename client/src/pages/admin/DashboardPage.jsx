import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadAdminUsers } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconList, IconSettings, IconSun, 
  IconUserPlus, IconZap, IconCreditCard, IconActivity,
  IconChartBar 
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
    { label: 'Total Users', val: total, tamil: 'மொத்த பயனர்கள்', icon: IconUsers, theme: 'bg-indigo-50/50 border-indigo-100 text-indigo-600' },
    { label: 'Paid Users', val: subUsers, tamil: 'சந்தாதாரர்கள்', icon: IconCreditCard, theme: 'bg-indigo-50/40 border-indigo-100/50 text-indigo-600' },
    { label: 'Trial Users', val: demoUsers, tamil: 'சோதனை பயனர்கள்', icon: IconZap, theme: 'bg-indigo-50/30 border-indigo-100/40 text-indigo-500' },
    { label: 'App Usage', val: totalUsage, tamil: 'பயன்பாடு', icon: IconActivity, theme: 'bg-emerald-50/50 border-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">
            {language === 'en' ? 'നിർவாகம் · Portal Dashboard' : 'நிர்வாகம் · போர்டல் டாஷ்போர்டு'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {language === 'en' ? 'Overview' : 'கண்ணோட்டம்'}
          </h1>
        </div>
        <div className="sm:text-right">
            <p className="text-base sm:text-lg font-bold text-slate-900">
               {language === 'en' ? 'Welcome' : 'வரவேற்கிறோம்'}, {user?.name || user?.username}
            </p>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center sm:justify-end gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {language === 'en' ? 'System Active' : 'கணினி செயல்படுகிறது'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`border p-6 rounded-2xl shadow-sm transition-all hover:shadow-md ${s.theme}`}>
             <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{language === 'en' ? s.label : s.tamil}</span>
                <s.icon size={18} className="opacity-40" />
             </div>
             <div className="text-2xl sm:text-3xl font-bold">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-5 flex items-center gap-3 after:h-px after:flex-1 after:bg-slate-100">
            {language === 'en' ? 'System Navigation' : 'கணினி ஆய்வு'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickLink 
              to="/admin/users" 
              icon={IconUserPlus} 
              label={language === 'en' ? 'Users List' : 'பயனர்கள்'}
              sub={language === 'en' ? 'Manage accounts & limits' : 'கணக்கு மேலாண்மை'} 
            />
            <QuickLink 
              to="/admin/subscriptions" 
              icon={IconCreditCard} 
              label={language === 'en' ? 'Subscriptions' : 'சந்தா'} 
              sub={language === 'en' ? 'Manage paid users' : 'கணக்கு மேலாண்மை'} 
            />
            <QuickLink 
              to="/admin/reports" 
              icon={IconChartBar} 
              label={language === 'en' ? 'Reports' : 'அறிக்கைகள்'} 
              sub={language === 'en' ? 'Data Intelligence' : 'புள்ளிவிவரங்கள்'} 
            />
            <QuickLink 
              to="/admin/palangal" 
              icon={IconList} 
              label={language === 'en' ? 'Palangal' : 'பலன்கள்'} 
              sub={language === 'en' ? 'Edit prediction texts' : 'பலன் மேலாண்மை'} 
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

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-5 flex items-center gap-3 after:h-px after:flex-1 after:bg-slate-100">
            {language === 'en' ? 'Global Top Locations' : 'முக்கிய இடங்கள்'}
          </h2>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-2 shadow-sm">
            {(() => {
              const globalFreq = {};
              users.forEach(u => {
                Object.entries(u.usageStats?.locationFrequency || {}).forEach(([loc, count]) => {
                  globalFreq[loc] = (globalFreq[loc] || 0) + count;
                });
              });
              const sorted = Object.entries(globalFreq).sort(([,a], [,b]) => b - a).slice(0, 5);
              
              if (sorted.length === 0) return <p className="text-center py-6 text-slate-300 font-semibold uppercase text-[10px] italic">No data collected</p>;

              return sorted.map(([loc, count], idx) => (
                <div key={loc} className="flex items-center justify-between p-3 bg-slate-50 border border-transparent hover:border-amber-100 transition-all group gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded bg-white flex items-center justify-center text-[9px] font-bold text-slate-300 group-hover:text-amber-500 shadow-sm shrink-0">{idx + 1}</span>
                    <span className="font-bold text-slate-900 text-xs truncate">{loc}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-1 w-12 sm:w-16 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / sorted[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400">{count}</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-900 rounded-xl flex flex-row items-center justify-between gap-2 text-white">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security: <span className="text-white">Active</span></p>
         </div>
         <span className="text-[9px] font-medium text-slate-500 italic">v1.5.2</span>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, sub, amber }) {
  return (
    <Link to={to} className={`p-5 bg-white border border-slate-100 rounded-xl group hover:bg-slate-900 transition-all shadow-sm hover:shadow-md`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all group-hover:bg-white/10 group-hover:text-white ${amber ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
        <Icon size={20} />
      </div>
      <strong className="block text-base font-bold text-slate-900 group-hover:text-white mb-0.5 transition-colors">{label}</strong>
      <span className="text-[10px] text-slate-400 block font-medium group-hover:text-white/40 transition-colors leading-relaxed">{sub}</span>
    </Link>
  );
}
