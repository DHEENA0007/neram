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

  // Analytics Helpers
  const nonAdminUsers = useMemo(() => users.filter(u => u.role !== 'admin'), [users]);
  const totalUsers = nonAdminUsers.length;
  const subscribedUsers = nonAdminUsers.filter(u => u.userType === 'subscribed').length;
  const totalGenerations = nonAdminUsers.reduce((acc, u) => acc + (u.usageStats?.generationsCount || 0), 0);
  
  const conversionRate = totalUsers > 0 ? ((subscribedUsers / totalUsers) * 100).toFixed(1) : 0;

  // Group locations globally
  const topLocations = useMemo(() => {
    const locs = {};
    nonAdminUsers.forEach(u => {
      Object.entries(u.usageStats?.locationFrequency || {}).forEach(([loc, count]) => {
        locs[loc] = (locs[loc] || 0) + count;
      });
    });
    return Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [nonAdminUsers]);

  // Feature usage distribution
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

  // Growth Data (Last 7 days registration simplified)
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

  function exportCSV() {
    const headers = ['Name', 'Username', 'Role', 'Type', 'Generations', 'Downloads', 'NallaNeram', 'Joined'];
    const rows = nonAdminUsers.map(u => [
      u.name,
      u.username,
      u.role,
      u.userType,
      u.usageStats?.generationsCount || 0,
      u.usageStats?.downloadsCount || 0,
      u.usageStats?.nallaNeramCount || 0,
      new Date(u.createdAt).toLocaleDateString()
    ]);
    const csvContent = 
      headers.join(",") + "\n" +
      rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `neram_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const [showVisualizer, setShowVisualizer] = useState(false);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[600px] bg-slate-50/50 rounded-[2rem]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-2 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
        <div className="text-center">
            <p className="text-base font-semibold text-slate-800 uppercase tracking-wider">Loading Analytics</p>
            <p className="text-xs font-medium text-slate-400 mt-1 uppercase">Connecting to server...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page space-y-8 pb-24 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <IconChartBar size={20} />
             </div>
             <h1 className="text-4xl font-bold text-slate-900 leading-tight">
               {language === 'en' ? 'Activity Reports' : 'அறிக்கைகள்'}
             </h1>
          </div>
          <p className="text-slate-400 font-medium text-base max-w-2xl leading-relaxed">
            {language === 'en' 
               ? 'View app usage, user growth, and top locations in real-time.' 
               : 'பயன்பாடு, வளர்ச்சி மற்றும் முக்கிய இடங்களை நிகழ்நேரத்தில் காண்க.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
           <button 
            onClick={() => setShowVisualizer(true)}
            className="group flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-semibold uppercase tracking-wider hover:border-amber-500 hover:text-amber-500 transition-all active:scale-95"
           >
             <IconPalette size={16} />
             {language === 'en' ? 'Create Report PDF' : 'அறிக்கை தயார் செய்'}
           </button>
           <button 
            onClick={exportCSV}
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-xs font-semibold uppercase tracking-wider hover:bg-black transition-all active:scale-95"
           >
             <IconDownload size={16} />
             {language === 'en' ? 'Download Excel' : 'தரவு பதிவிறக்கம்'}
           </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard icon={IconUsers} label="Total Users" value={totalUsers} sub="All registered accounts" trend="+12%" color="indigo" />
         <StatCard icon={IconShieldCheck} label="Paid Users" value={`${conversionRate}%`} sub="Subscription rate" trend="Good" color="emerald" />
         <StatCard icon={IconActivity} label="App Usage" value={totalGenerations} sub="Total predictions" trend="+4.2k" color="amber" />
         <StatCard icon={IconMapPin} label="Active Cities" value={topLocations.length} sub="Geographic spread" trend="Fixed" color="rose" />
      </div>

      {/* Analytics Main Zone */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* User Growth Chart */}
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-start mb-8">
              <div>
                 <h3 className="text-xl font-bold text-slate-900">New Signups</h3>
                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{language === 'en' ? 'Users joined in last 7 days' : 'கடந்த 7 நாட்களில் சேர்ந்த பயனர்கள்'}</p>
              </div>
              <div className="flex gap-2 items-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Join Count</span>
              </div>
           </div>

           <div className="h-64 mt-6 flex items-end justify-between gap-4 px-2">
              {growthData.map(([date, count], i) => {
                 const currentMax = Math.max(...growthData.map(d => d[1]), 5);
                 const height = (count / currentMax) * 100;
                 return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-3">
                       <div className="relative w-full flex justify-center">
                          <div 
                             style={{ height: `${Math.max(height, 2)}%` }} 
                             className={`w-full max-w-[32px] rounded-t-lg transition-all duration-700 ${count > 0 ? 'bg-amber-500' : 'bg-slate-50'}`}
                          />
                       </div>
                       <span className="text-[9px] font-medium text-slate-300 uppercase">
                          {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                       </span>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Feature Usage */}
        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-bold text-slate-900">Most Used Features</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Where users spend time</p>
           </div>
           
           <div className="my-6 relative flex justify-center py-4">
              <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90">
                {(() => {
                  const r = 35;
                  const circ = 2 * Math.PI * r;
                  const pPct = (featureUsage.panchaPakshi / featureUsage.total) * 100;
                  const nPct = (featureUsage.nallaNeram / featureUsage.total) * 100;
                  
                  const pOffset = 0;
                  const nOffset = circ * (pPct / 100);
                  const dOffset = circ * ((pPct + nPct) / 100);
                  const dPct = (featureUsage.downloads / featureUsage.total) * 100;

                  return (
                    <>
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                      {pPct > 0 && <circle cx="50" cy="50" r={r} fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={`${circ * (pPct / 100)} ${circ}`} strokeDashoffset={-pOffset} strokeLinecap="round" />}
                      {nPct > 0 && <circle cx="50" cy="50" r={r} fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray={`${circ * (nPct / 100)} ${circ}`} strokeDashoffset={-nOffset} strokeLinecap="round" />}
                      {dPct > 0 && <circle cx="50" cy="50" r={r} fill="none" stroke="#f43f5e" strokeWidth="8" strokeDasharray={`${circ * (dPct / 100)} ${circ}`} strokeDashoffset={-dOffset} strokeLinecap="round" />}
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-bold text-slate-800">{(featureUsage.total/1000).toFixed(1)}k</span>
                 <span className="text-[10px] font-semibold text-slate-400 uppercase">Hits</span>
              </div>
           </div>

           <div className="space-y-4 pt-6 border-t border-slate-50">
              <DistributionRow label="Pancha Pakshi" pct={((featureUsage.panchaPakshi/featureUsage.total)*100).toFixed(1)} count={featureUsage.panchaPakshi} color="bg-amber-500" />
              <DistributionRow label="Nalla Neram" pct={((featureUsage.nallaNeram/featureUsage.total)*100).toFixed(1)} count={featureUsage.nallaNeram} color="bg-indigo-500" />
              <DistributionRow label="Downloads" pct={((featureUsage.downloads/featureUsage.total)*100).toFixed(1)} count={featureUsage.downloads} color="bg-rose-500" />
           </div>
        </div>

        {/* Top Locations */}
        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col">
           <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900">Top Locations</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{language === 'en' ? 'Where are users searching from' : 'பயனர்கள் எங்கிருந்து தேடுகிறார்கள்'}</p>
           </div>
           
           <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {topLocations.map(([loc, count], i) => (
               <div key={loc} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">{i+1}</div>
                   <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[170px]">{loc}</span>
                      <span className="text-[9px] font-medium text-slate-400 uppercase">City</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{count}</span>
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Top Users Table */}
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Top Active Users</h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{language === 'en' ? 'Users with highest prediction counts' : 'அதிகப்படியான கணிப்புகளைப் பயன்படுத்திய பயனர்கள்'}</p>
              </div>
           </div>
           
           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Name</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Usage Count</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Downloads</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Joined Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {nonAdminUsers.sort((a,b) => (b.usageStats?.generationsCount || 0) - (a.usageStats?.generationsCount || 0)).slice(0, 5).map((u, idx) => (
                   <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm uppercase group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all">
                                 {u.name[0]}
                              </div>
                              {idx < 3 && (
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[9px]">
                                   <IconAward size={10} />
                                </div>
                              )}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] font-medium text-slate-400 lowercase">@{u.username}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <span className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                           {u.usageStats?.generationsCount || 0}
                        </span>
                     </td>
                     <td className="px-8 py-5 text-center text-sm font-medium text-slate-400 lowercase">{u.usageStats?.downloadsCount || 0} hits</td>
                     <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-[11px] font-semibold text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                           <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg ${u.userType === 'subscribed' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 text-slate-500'} mt-1`}>
                              {u.userType}
                           </span>
                        </div>
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

function StatCard({ icon: Icon, label, value, sub, trend, color }) {
  const styles = {
    indigo: 'bg-indigo-50/50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50/50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50/50 text-rose-600 border-rose-100',
  };

  return (
    <div className={`p-8 rounded-[2rem] bg-white border border-slate-100 flex flex-col hover:shadow-lg transition-all`}>
       <div className={`w-12 h-12 rounded-xl ${styles[color]} border flex items-center justify-center mb-6`}>
          <Icon size={24} />
       </div>
       <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
            <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
          </div>
          <div className="text-right">
             <div className="flex items-center gap-1 justify-end">
                <span className={`text-[10px] font-bold ${color === 'emerald' ? 'text-emerald-500' : 'text-slate-900'}`}>{trend}</span>
                <IconTrendingUp size={10} className={color === 'emerald' ? 'text-emerald-500' : 'text-slate-900'} />
             </div>
             <p className="text-[9px] font-medium mt-1 text-slate-300 uppercase">{sub}</p>
          </div>
       </div>
    </div>
  );
}

function DistributionRow({ label, pct, count, color }) {
  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-slate-400 flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
             {label}
          </span>
          <span className="text-slate-900">{pct}% <span className="text-slate-300 ml-1">({count})</span></span>
       </div>
       <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-[1000ms]`} style={{ width: `${pct}%` }} />
       </div>
    </div>
  );
}

function ReportVisualizer({ data, onClose, language }) {
  const [options, setOptions] = useState({
     showStats: true,
     showGrowth: true,
     showUsage: true,
     showTopUsers: true
  });

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
    const gradient = ctx.createLinearGradient(0, 0, 800, 250);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#334155');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 250);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 12px Inter, sans-serif';
    ctx.fillText('OFFICIAL ACTIVITY REPORT', 60, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 40px Inter, sans-serif';
    ctx.fillText(language === 'en' ? 'App Summary' : 'செயல்பாட்டு அறிக்கை', 60, 140);
    ctx.font = '500 14px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 60, 175);
    let currentY = 300;

    if (options.showStats) {
        const drawMetric = (x, y, label, value, color) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x, y, 160, 90, 16);
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.font = '700 10px Inter';
          ctx.fillText(label.toUpperCase(), x + 20, y + 35);
          ctx.fillStyle = '#1e293b';
          ctx.font = '700 24px Inter';
          ctx.fillText(String(value), x + 20, y + 70);
        };
        drawMetric(60, currentY, 'Users', data.totalUsers, '#f1f5f9');
        drawMetric(240, currentY, 'Usage', data.totalGenerations, '#fef9e7');
        drawMetric(420, currentY, 'Subscribers', data.subscribedUsers, '#ecfdf5');
        drawMetric(600, currentY, 'Cities', data.topLocations.length, '#fff1f2');
        currentY += 140;
    }

    if (options.showUsage) {
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 20px Inter';
        ctx.fillText('Usage Breakdown', 60, currentY);
        currentY += 40;
        const features = [
          { label: 'Pancha Pakshi', val: data.featureUsage.panchaPakshi, col: '#f59e0b' },
          { label: 'Nalla Neram', val: data.featureUsage.nallaNeram, col: '#6366f1' },
          { label: 'Downloads', val: data.featureUsage.downloads, col: '#f43f5e' }
        ];
        features.forEach((f, i) => {
          const y = currentY + (i * 60);
          const width = data.featureUsage.total > 0 ? (f.val / data.featureUsage.total) * 600 : 0;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(60, y, 680, 32, 8);
          ctx.fill();
          ctx.fillStyle = f.col;
          ctx.beginPath();
          ctx.roundRect(60, y, Math.max(10, width), 32, 8);
          ctx.fill();
          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px Inter';
          ctx.fillText(f.label, 60, y - 6);
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 10px Inter';
          if (width > 50) ctx.fillText(`${f.val}`, 75, y + 20);
        });
        currentY += 190;
    }

    if (options.showTopUsers) {
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 20px Inter';
        ctx.fillText('Most Active Members', 60, currentY);
        currentY += 40;
        const top = [...data.nonAdminUsers].sort((a,b) => (b.usageStats?.generationsCount || 0) - (a.usageStats?.generationsCount || 0)).slice(0, 5);
        top.forEach((u, i) => {
           const y = currentY + (i * 50);
           ctx.fillStyle = i % 2 === 0 ? '#fdfdfd' : '#ffffff';
           ctx.beginPath();
           ctx.roundRect(60, y, 680, 42, 8);
           ctx.fill();
           ctx.fillStyle = '#334155';
           ctx.font = '700 13px Inter';
           ctx.fillText(`${i+1}. ${u.name}`, 80, y + 26);
           ctx.fillStyle = '#94a3b8';
           ctx.font = '600 11px Inter';
           ctx.fillText(`${u.usageStats?.generationsCount || 0} searches`, 650, y + 26);
        });
    }
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 10px Inter';
    ctx.fillText('Neram Admin Portal · Strictly Confidential', 60, 1100);
  }, [data, language, options]);
 
  const downloadReport = () => {
    const canvas = document.getElementById('reportCanvas');
    const link = document.createElement('a');
    link.download = `neram_report_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };
 
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        
        <div className="w-80 border-r border-slate-100 p-10 flex flex-col justify-between bg-slate-50/50">
           <div className="space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                    <IconPalette size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">Customize</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Layout</p>
                 </div>
              </div>
              
              <div className="space-y-3">
                 <OptionToggle active={options.showStats} onClick={() => setOptions(o => ({...o, showStats: !o.showStats}))} label="Statistics" />
                 <OptionToggle active={options.showUsage} onClick={() => setOptions(o => ({...o, showUsage: !o.showUsage}))} label="Charts" />
                 <OptionToggle active={options.showTopUsers} onClick={() => setOptions(o => ({...o, showTopUsers: !o.showTopUsers}))} label="User Table" />
              </div>
           </div>
 
           <div className="space-y-3">
              <button onClick={downloadReport} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2">
                <IconDownload size={16} />
                {language === 'en' ? 'Download' : 'பதிவிறக்கம்'}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-5 bg-white text-slate-400 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all"
              >
                {language === 'en' ? 'Close' : 'மூடு'}
              </button>
           </div>
        </div>
 
        <div className="flex-1 bg-slate-100/30 p-10 overflow-y-auto flex items-start justify-center custom-scrollbar">
           <div className="shadow-xl origin-top scale-[0.85] bg-white">
              <canvas id="reportCanvas" style={{ width: '450px', height: '636px', background: '#fff' }} />
           </div>
        </div>
      </div>
    </div>
  );
}

function OptionToggle({ active, onClick, label }) {
   return (
      <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${active ? 'border-indigo-600 bg-white text-indigo-900 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
      >
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-transparent'}`}>
           <IconCheck size={12} />
        </div>
      </button>
   );
}
