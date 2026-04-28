import { useEffect, useState, useMemo } from 'react';
import { loadAdminUsers } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconActivity, IconCreditCard, IconCalendar, 
  IconDownload, IconChartBar, IconMapPin, IconTrendingUp,
  IconArrowRight, IconX, IconEye, IconPalette, IconLayout,
  IconTrendingDown, IconUserPlus, IconFileText, IconShieldCheck,
  IconClock, IconAward, IconGlobe, IconCheck
} from '../../components/Icons.jsx';

export function ReportsPage() {
  const { language } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminUsers().then((d) => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, []);

  const nonAdminUsers = useMemo(() => users.filter(u => u.role !== 'admin'), [users]);
  const totalUsers = nonAdminUsers.length;
  const subscribedUsers = nonAdminUsers.filter(u => u.userType === 'subscribed').length;
  const totalGenerations = nonAdminUsers.reduce((acc, u) => acc + (u.usageStats?.generationsCount || 0), 0);
  const conversionRate = totalUsers > 0 ? ((subscribedUsers / totalUsers) * 100).toFixed(1) : 0;

  const topLocations = useMemo(() => {
    const locs = {};
    nonAdminUsers.forEach(u => {
      Object.entries(u.usageStats?.locationFrequency || {}).forEach(([loc, count]) => {
        locs[loc] = (locs[loc] || 0) + count;
      });
    });
    return Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [nonAdminUsers]);

  const featureUsage = useMemo(() => {
    const usage = { panchaPakshi: 0, nallaNeram: 0, downloads: 0 };
    nonAdminUsers.forEach(u => {
      usage.panchaPakshi += (u.usageStats?.generationsCount || 0);
      usage.nallaNeram += (u.usageStats?.nallaNeramCount || 0);
      usage.downloads += (u.usageStats?.downloadsCount || 0);
    });
    const total = (usage.panchaPakshi + usage.nallaNeram + usage.downloads) || 1;
    return { ...usage, total };
  }, [nonAdminUsers]);

  const growthData = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    nonAdminUsers.forEach(u => {
      const date = new Date(u.createdAt).toISOString().split('T')[0];
      if (days[date] !== undefined) days[date]++;
    });
    return Object.entries(days);
  }, [nonAdminUsers]);

  const [showVisualizer, setShowVisualizer] = useState(false);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="admin-page space-y-6 pb-20 max-w-[1400px] mx-auto overflow-hidden">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <IconChartBar size={16} />
             </div>
             <h1 className="text-2xl font-bold text-slate-900">
               {language === 'en' ? 'Activity Reports' : 'அறிக்கைகள்'}
             </h1>
          </div>
          <p className="text-slate-400 font-medium text-xs">
            {language === 'en' ? 'Manage usage analytics and report generation.' : 'பயன்பாடு மற்றும் அறிக்கை உருவாக்கம்.'}
          </p>
        </div>

        <div className="flex gap-2">
           <button 
            onClick={() => setShowVisualizer(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:border-amber-500 transition-all active:scale-95"
           >
             <IconPalette size={14} />
             {language === 'en' ? 'New PDF' : 'புதிய PDF'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard icon={IconUsers} label="Total Users" value={totalUsers} trend="+12%" color="indigo" />
         <StatCard icon={IconShieldCheck} label="Paid Users" value={`${conversionRate}%`} trend="Good" color="emerald" />
         <StatCard icon={IconActivity} label="App Usage" value={totalGenerations} trend="+4.2k" color="amber" />
         <StatCard icon={IconMapPin} label="Locations" value={topLocations.length} trend="Live" color="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <h3 className="text-base font-bold text-slate-900">Signups (7D)</h3>
                 <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Registration trends</p>
              </div>
           </div>

           <div className="h-48 mt-4 flex items-end justify-between gap-3 px-1">
              {growthData.map(([date, count]) => {
                 const currentMax = Math.max(...growthData.map(d => d[1]), 5);
                 const height = (count / currentMax) * 100;
                 return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-2">
                       <div className="relative w-full flex justify-center">
                          <div 
                             style={{ height: `${Math.max(height, 5)}%` }} 
                             className={`w-full max-w-[24px] rounded-t-lg transition-all ${count > 0 ? 'bg-amber-500' : 'bg-slate-50'}`}
                          />
                       </div>
                       <span className="text-[8px] font-medium text-slate-300 uppercase">
                          {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                       </span>
                    </div>
                 );
              })}
           </div>
        </div>

        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
           <h3 className="text-base font-bold text-slate-900 mb-6">Feature Split</h3>
           
           <div className="space-y-4">
              <DistributionRow label="Pancha Pakshi" pct={((featureUsage.panchaPakshi/featureUsage.total)*100).toFixed(1)} count={featureUsage.panchaPakshi} color="bg-amber-500" />
              <DistributionRow label="Nalla Neram" pct={((featureUsage.nallaNeram/featureUsage.total)*100).toFixed(1)} count={featureUsage.nallaNeram} color="bg-indigo-500" />
              <DistributionRow label="Downloads" pct={((featureUsage.downloads/featureUsage.total)*100).toFixed(1)} count={featureUsage.downloads} color="bg-rose-500" />
           </div>
        </div>

        <div className="xl:col-span-12 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-50">
              <h3 className="text-base font-bold text-slate-900">Active Users</h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase">Identity</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase text-center">Hits</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase text-center">Downloads</th>
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase text-right">Joined</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {nonAdminUsers.sort((a,b) => (b.usageStats?.generationsCount || 0) - (a.usageStats?.generationsCount || 0)).slice(0, 5).map((u, idx) => (
                   <tr key={u.id}>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs uppercase">{u.name[0]}</div>
                           <div>
                              <p className="text-xs font-bold text-slate-900">{u.name}</p>
                              <p className="text-[9px] font-medium text-slate-400">@{u.username}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                           {u.usageStats?.generationsCount || 0}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-center text-[10px] font-medium text-slate-400">{u.usageStats?.downloadsCount || 0}</td>
                     <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-semibold text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>

      {showVisualizer && <ReportVisualizer data={{ totalUsers, totalGenerations, subscribedUsers, topLocations, featureUsage, nonAdminUsers }} onClose={() => setShowVisualizer(false)} language={language} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }) {
  const styles = {
    indigo: 'bg-indigo-50/30 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50/30 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50/30 text-amber-600 border-amber-100',
    rose: 'bg-rose-50/30 text-rose-600 border-rose-100',
  };

  return (
    <div className={`p-6 rounded-2xl bg-white border border-slate-100 flex flex-col hover:shadow-sm`}>
       <div className={`w-10 h-10 rounded-xl ${styles[color]} border flex items-center justify-center mb-4`}>
          <Icon size={20} />
       </div>
       <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
            <h4 className="text-xl font-bold text-slate-900">{value}</h4>
          </div>
          <div className="flex items-center gap-1">
             <span className="text-[9px] font-bold text-slate-900">{trend}</span>
          </div>
       </div>
    </div>
  );
}

function DistributionRow({ label, pct, count, color }) {
  return (
    <div className="space-y-1.5">
       <div className="flex items-center justify-between text-[9px] font-bold uppercase">
          <span className="text-slate-400 flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
             {label}
          </span>
          <span className="text-slate-900 font-bold">{pct}%</span>
       </div>
       <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
       </div>
    </div>
  );
}

function ReportVisualizer({ data, onClose, language }) {
  const [options, setOptions] = useState({ showStats: true, showUsage: true, showTopUsers: true });

  useEffect(() => {
    const canvas = document.getElementById('reportCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = 800 * dpr;
    canvas.height = 1130 * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1130);
    const grad = ctx.createLinearGradient(0, 0, 800, 200);
    grad.addColorStop(0, '#0f172a'); grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 220);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px Inter, sans-serif';
    ctx.fillText('Report Summary', 50, 120);
    let currentY = 280;

    if (options.showStats) {
        const drawM = (x, y, l, v, c) => {
          ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, 160, 80, 12); ctx.fill();
          ctx.fillStyle = '#64748b'; ctx.font = '700 10px Inter'; ctx.fillText(l.toUpperCase(), x + 20, y + 30);
          ctx.fillStyle = '#1e293b'; ctx.font = '700 24px Inter'; ctx.fillText(String(v), x + 20, y + 65);
        };
        drawM(50, currentY, 'Users', data.totalUsers, '#f8fafc');
        drawM(230, currentY, 'Usage', data.totalGenerations, '#f8fafc');
        drawM(410, currentY, 'Paid', data.subscribedUsers, '#f8fafc');
        drawM(590, currentY, 'Locs', data.topLocations.length, '#f8fafc');
        currentY += 130;
    }
    // ... rest of canvas simplified
  }, [data, language, options]);
 
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden">
        <div className="w-64 border-r border-slate-100 p-8 bg-slate-50/30 flex flex-col justify-between">
           <div className="space-y-8">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Options</h3>
              <div className="space-y-2">
                 {Object.keys(options).map(key => (
                   <button key={key} onClick={() => setOptions(o => ({...o, [key]: !o[key]}))} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all ${options[key] ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      {key.replace('show', '')}
                   </button>
                 ))}
              </div>
           </div>
           <button onClick={onClose} className="w-full py-4 bg-white border border-slate-100 text-slate-400 font-bold text-[10px] uppercase rounded-xl">Close</button>
        </div>
        <div className="flex-1 p-8 overflow-y-auto bg-slate-100/50 flex items-center justify-center">
           <canvas id="reportCanvas" style={{ width: '400px', height: '565px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
        </div>
      </div>
    </div>
  );
}
