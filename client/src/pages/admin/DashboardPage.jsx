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
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-sm sm:text-base font-black uppercase tracking-[0.3em] text-amber-500 mb-2 sm:mb-4">
            {language === 'en' ? 'நிர்வாகம் · Portal Dashboard' : 'நிர்வாகம் · போர்டல் டாஷ்போர்டு'}
          </p>
          <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tighter">
            {language === 'en' ? 'Overview' : 'கண்ணோட்டம்'}
          </h1>
        </div>
        <div className="sm:text-right">
            <p className="text-lg sm:text-2xl font-black text-slate-900">
               {language === 'en' ? 'Welcome' : 'வரவேற்கிறோம்'}, {user?.name || user?.username}
            </p>
            <span className="text-sm sm:text-base text-emerald-600 font-bold flex items-center sm:justify-end gap-2 mt-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 animate-pulse" /> {language === 'en' ? 'System Active' : 'கணினி செயல்படுகிறது'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map(s => (
          <div key={s.label} className={`border p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.02] ${s.theme}`}>
             <div className="flex items-center justify-between mb-4 sm:mb-6">
                <span className="text-sm sm:text-base font-black uppercase tracking-[0.2em] opacity-70">{language === 'en' ? s.label : s.tamil}</span>
                <s.icon size={26} className="opacity-50" />
             </div>
             <div className="text-4xl sm:text-6xl font-black mb-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300 mb-8 flex items-center gap-4 after:h-px after:flex-1 after:bg-slate-200">
            {language === 'en' ? 'System Navigation' : 'கணினி ஆய்வு'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300 mb-8 flex items-center gap-4 after:h-px after:flex-1 after:bg-slate-200">
            {language === 'en' ? 'Global Top Locations' : 'முக்கிய இடங்கள்'}
          </h2>
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-3 sm:space-y-4 shadow-sm">
            {(() => {
              const globalFreq = {};
              users.forEach(u => {
                Object.entries(u.usageStats?.locationFrequency || {}).forEach(([loc, count]) => {
                  globalFreq[loc] = (globalFreq[loc] || 0) + count;
                });
              });
              const sorted = Object.entries(globalFreq).sort(([,a], [,b]) => b - a).slice(0, 5);
              
              if (sorted.length === 0) return <p className="text-center py-12 text-slate-300 font-bold uppercase tracking-widest text-xs italic">Gathering intelligence...</p>;

              return sorted.map(([loc, count], idx) => (
                <div key={loc} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-transparent hover:border-amber-200 hover:bg-white transition-all group gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-xs font-black text-slate-300 group-hover:text-amber-500 shadow-sm shrink-0">{idx + 1}</span>
                    <span className="font-black text-slate-900 text-sm sm:text-base truncate">{loc}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="h-1.5 w-12 sm:w-24 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / sorted[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{count}</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 bg-slate-900 rounded-2xl sm:rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-white shadow-xl shadow-slate-900/10">
         <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-xs sm:text-sm font-black uppercase tracking-wider sm:tracking-widest text-slate-400">Security Check: <span className="text-white">Passed</span></p>
         </div>
         <span className="text-xs sm:text-sm font-bold text-slate-500 italic ml-6 sm:ml-0">v1.5.2 Stable</span>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, sub, amber }) {
  return (
    <Link to={to} className={`p-8 sm:p-10 bg-white border border-slate-100 rounded-[2.5rem] sm:rounded-[3rem] group hover:bg-slate-900 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-2`}>
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 transition-all group-hover:bg-white/10 group-hover:text-white ${amber ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
        <Icon size={28} />
      </div>
      <strong className="block text-xl sm:text-2xl font-black text-slate-900 group-hover:text-white mb-2 transition-colors">{label}</strong>
      <span className="text-sm sm:text-base text-slate-400 block font-bold group-hover:text-white/40 transition-colors leading-relaxed">{sub}</span>
    </Link>
  );
}
