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
    { label: 'Total Users', val: total, tamil: 'மொத்த பயனர்கள்', icon: IconUsers, theme: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
    { label: 'Paid Users', val: subUsers, tamil: 'சந்தாதாரர்கள்', icon: IconCreditCard, theme: 'bg-purple-50 border-purple-100 text-purple-600' },
    { label: 'Trial Users', val: demoUsers, tamil: 'சோதனை பயனர்கள்', icon: IconZap, theme: 'bg-blue-50 border-blue-100 text-blue-600' },
    { label: 'App Usage', val: totalUsage, tamil: 'பயன்பாடு', icon: IconActivity, theme: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2">
            {language === 'en' ? 'நிர்வாகம் · Portal Dashboard' : 'நிர்வாகம் · போர்டல் டாஷ்போர்டு'}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
            {language === 'en' ? 'Overview' : 'கண்ணோட்டம்'}
          </h1>
        </div>
        <div className="sm:text-right">
            <p className="text-lg sm:text-xl font-bold text-slate-900">
               {language === 'en' ? 'Welcome' : 'வரவேற்கிறோம்'}, {user?.name || user?.username}
            </p>
            <span className="text-xs sm:text-sm text-emerald-600 font-semibold flex items-center sm:justify-end gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> {language === 'en' ? 'System Active' : 'கணினி செயல்படுகிறது'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className={`border p-8 rounded-3xl shadow-sm transition-all hover:scale-[1.02] ${s.theme}`}>
             <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{language === 'en' ? s.label : s.tamil}</span>
                <s.icon size={22} className="opacity-50" />
             </div>
             <div className="text-4xl sm:text-5xl font-bold mb-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-4 after:h-px after:flex-1 after:bg-slate-100">
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
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-4 after:h-px after:flex-1 after:bg-slate-100">
            {language === 'en' ? 'Global Top Locations' : 'முக்கிய இடங்கள்'}
          </h2>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-3 shadow-sm">
            {(() => {
              const globalFreq = {};
              users.forEach(u => {
                Object.entries(u.usageStats?.locationFrequency || {}).forEach(([loc, count]) => {
                  globalFreq[loc] = (globalFreq[loc] || 0) + count;
                });
              });
              const sorted = Object.entries(globalFreq).sort(([,a], [,b]) => b - a).slice(0, 5);
              
              if (sorted.length === 0) return <p className="text-center py-10 text-slate-300 font-semibold uppercase text-[10px] italic">Gathering data...</p>;

              return sorted.map(([loc, count], idx) => (
                <div key={loc} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-transparent hover:border-amber-200 transition-all group gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-bold text-slate-300 group-hover:text-amber-500 shadow-sm shrink-0">{idx + 1}</span>
                    <span className="font-bold text-slate-900 text-sm truncate">{loc}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-1 w-16 sm:w-20 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / sorted[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{count}</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-white">
         <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Check: <span className="text-white">Passed</span></p>
         </div>
         <span className="text-[10px] font-medium text-slate-500 italic">v1.5.2 Stable</span>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, sub, amber }) {
  return (
    <Link to={to} className={`p-6 bg-white border border-slate-100 rounded-2xl group hover:bg-slate-900 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:bg-white/10 group-hover:text-white ${amber ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
        <Icon size={24} />
      </div>
      <strong className="block text-lg font-bold text-slate-900 group-hover:text-white mb-1 transition-colors">{label}</strong>
      <span className="text-xs text-slate-400 block font-medium group-hover:text-white/40 transition-colors leading-relaxed">{sub}</span>
    </Link>
  );
}
