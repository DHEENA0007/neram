import { useEffect, useState, useMemo } from 'react';
import { loadAdminUsers } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconActivity, IconCreditCard, IconCalendar, 
  IconDownload, IconChartBar, IconMapPin, IconTrendingUp,
  IconArrowRight, IconX, IconEye, IconPalette, IconLayout,
  IconTrendingDown, IconUserPlus, IconFileText, IconShieldCheck,
  IconClock, IconAward, IconGlobe
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
  
  const avgUsage = totalUsers > 0 ? (totalGenerations / totalUsers).toFixed(1) : 0;
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
    link.setAttribute("download", `neram_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const [showVisualizer, setShowVisualizer] = useState(false);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[600px] bg-slate-50/50 rounded-[3rem]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
        <div className="text-center">
            <p className="text-lg font-black text-slate-800 uppercase tracking-widest">Aggregating Metrics</p>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tight">Accessing real-time analytical nodes...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page space-y-10 pb-24 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                <IconActivity size={24} />
             </div>
             <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
               {language === 'en' ? 'Intelligence Hub' : 'நுண்ணறிவு மையம்'}
             </h1>
          </div>
          <p className="text-slate-400 font-bold text-lg max-w-2xl leading-relaxed">
            {language === 'en' 
               ? 'Comprehensive ecosystem analysis, user behavior tracking, and strategic performance metrics.' 
               : 'விரிவான சுற்றுச்சூழல் பகுப்பாய்வு, பயனர் நடத்தை கண்காணிப்பு மற்றும் செயல்திறன் அளவீடுகள்.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
           <button 
            onClick={() => setShowVisualizer(true)}
            className="group flex items-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:border-amber-500 hover:text-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all active:scale-95"
           >
             <IconPalette size={18} className="group-hover:rotate-12 transition-transform" />
             {language === 'en' ? 'Canvas Report' : 'கேன்வாஸ் அறிக்கை'}
           </button>
           <button 
            onClick={exportCSV}
            className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-black hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95"
           >
             <IconDownload size={18} />
             {language === 'en' ? 'Export Data' : 'தரவு ஏற்றுமதி'}
           </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard icon={IconUsers} label="Community Size" value={totalUsers} sub="Unique identities" trend="+12.4%" color="indigo" />
         <StatCard icon={IconShieldCheck} label="Premium Adopters" value={`${conversionRate}%`} sub="Paid conversion" trend="Optimal" color="emerald" />
         <StatCard icon={IconActivity} label="Platform Vitality" value={totalGenerations} sub="Total interactions" trend="+4.2k" color="amber" />
         <StatCard icon={IconMapPin} label="Geographic Reach" value={topLocations.length} sub="Cities identified" trend="Stable" color="rose" />
      </div>

      {/* Analytics Main Zone */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* User Growth Chart - Bar Chart SVG */}
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-start mb-12">
              <div>
                 <h3 className="text-2xl font-black text-slate-900 leading-tight">Subscriber Velocity</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{language === 'en' ? 'Registration metrics for last 7 days' : 'கடந்த 7 நாட்களில் பதிவு அளவீடுகள்'}</p>
              </div>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Users</span>
              </div>
           </div>

           <div className="h-64 mt-10 flex items-end justify-between gap-4 px-2">
              {growthData.map(([date, count], i) => {
                 const currentMax = Math.max(...growthData.map(d => d[1]), 5);
                 const height = (count / currentMax) * 100;
                 return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-4 group/bar">
                       <div className="relative w-full flex justify-center">
                          {count > 0 && (
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                               <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">{count}</span>
                            </div>
                          )}
                          <div 
                             style={{ height: `${Math.max(height, 2)}%` }} 
                             className={`w-full max-w-[40px] rounded-t-xl transition-all duration-1000 ${count > 0 ? 'bg-amber-500 group-hover/bar:bg-slate-900' : 'bg-slate-50'}`}
                          />
                       </div>
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                       </span>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Feature Usage - Donut/Distribution */}
        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-[4rem] p-12 shadow-sm flex flex-col justify-between overflow-hidden">
           <div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Feature Affinity</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Utilization distribution</p>
           </div>
           
           <div className="my-10 relative flex justify-center py-6">
              <svg viewBox="0 0 100 100" className="w-56 h-56 -rotate-90 drop-shadow-2xl">
                {(() => {
                  const r = 35;
                  const circ = 2 * Math.PI * r;
                  const pPct = (featureUsage.panchaPakshi / featureUsage.total) * 100;
                  const nPct = (featureUsage.nallaNeram / featureUsage.total) * 100;
                  const dPct = (featureUsage.downloads / featureUsage.total) * 100;
                  
                  const pOffset = 0;
                  const nOffset = circ * (pPct / 100);
                  const dOffset = circ * ((pPct + nPct) / 100);

                  return (
                    <>
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      {pPct > 0 && <circle cx="50" cy="50" r={r} fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray={`${circ * (pPct / 100)} ${circ}`} strokeDashoffset={-pOffset} strokeLinecap="round" className="transition-all duration-1000" />}
                      {nPct > 0 && <circle cx="50" cy="50" r={r} fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray={`${circ * (nPct / 100)} ${circ}`} strokeDashoffset={-nOffset} strokeLinecap="round" className="transition-all duration-1000" />}
                      {dPct > 0 && <circle cx="50" cy="50" r={r} fill="none" stroke="#f43f5e" strokeWidth="10" strokeDasharray={`${circ * (dPct / 100)} ${circ}`} strokeDashoffset={-dOffset} strokeLinecap="round" className="transition-all duration-1000" />}
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-4xl font-black text-slate-800 tracking-tighter">{(featureUsage.total/1000).toFixed(1)}k</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Interactions</span>
              </div>
           </div>

           <div className="space-y-4 pt-10 border-t border-slate-50">
              <DistributionRow label="Pancha Pakshi" pct={((featureUsage.panchaPakshi/featureUsage.total)*100).toFixed(1)} count={featureUsage.panchaPakshi} color="bg-amber-500" />
              <DistributionRow label="Nalla Neram" pct={((featureUsage.nallaNeram/featureUsage.total)*100).toFixed(1)} count={featureUsage.nallaNeram} color="bg-indigo-500" />
              <DistributionRow label="Downloads" pct={((featureUsage.downloads/featureUsage.total)*100).toFixed(1)} count={featureUsage.downloads} color="bg-rose-500" />
           </div>
        </div>

        {/* Global Locations - Vertical List */}
        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm flex flex-col overflow-hidden">
           <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Geographic Density</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{language === 'en' ? 'Active hotspots by search frequency' : 'தேடல் அதிர்வெண் மூலம் செயலில் உள்ள பகுதிகள்'}</p>
           </div>
           
           <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {topLocations.map(([loc, count], i) => (
               <div key={loc} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 hover:bg-slate-100 transition-all group cursor-default border border-transparent hover:border-slate-200">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">{i+1}</div>
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 truncate max-w-[170px]">{loc}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Active Node</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900 tabular-nums">{count}</span>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                 </div>
               </div>
             ))}
             {topLocations.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-20">
                   <IconMapPin size={48} className="mb-4 text-slate-300" />
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">Zero footprints identified</p>
                </div>
             )}
           </div>
        </div>

        {/* Subscriber Intelligence Table */}
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden flex flex-col">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Subscriber Intelligence</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{language === 'en' ? 'Active top contributors by engagement score' : 'நிச்சயதார்த்த மதிப்பெண் மூலம் செயலில் உள்ள சிறந்த பங்களிப்பாளர்கள்'}</p>
              </div>
              <div className="px-6 py-2.5 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                 High Fidelity
              </div>
           </div>
           
           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-[0.1em]">Persona Identity</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center tracking-[0.1em]">Engagements</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center tracking-[0.1em]">Data Access</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right tracking-[0.1em]">System Entry</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {nonAdminUsers.sort((a,b) => (b.usageStats?.generationsCount || 0) - (a.usageStats?.generationsCount || 0)).slice(0, 5).map((u, idx) => (
                   <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                           <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 font-black text-base uppercase group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all">
                                 {u.name[0]}
                              </div>
                              {idx < 3 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-lg">
                                   <IconAward size={12} />
                                </div>
                              )}
                           </div>
                           <div>
                              <p className="text-base font-black text-slate-900 group-hover:translate-x-1 transition-transform">{u.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">@{u.username}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-6 text-center">
                        <span className="text-sm font-black text-slate-700 bg-slate-50 px-5 py-2.5 rounded-2xl tabular-nums border border-slate-100">
                           {u.usageStats?.generationsCount || 0}
                        </span>
                     </td>
                     <td className="px-10 py-6 text-center text-sm font-bold text-slate-400 tabular-nums lowercase">{u.usageStats?.downloadsCount || 0} reqs</td>
                     <td className="px-10 py-6 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-black text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                           <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${u.userType === 'subscribed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'} mt-1.5`}>
                              {u.userType}
                           </span>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

           <div className="p-10 bg-slate-50/30 border-t border-slate-100 flex justify-center">
              <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 hover:shadow-xl hover:shadow-slate-900/5 transition-all">
                 <IconLayout size={14} /> Analyze Full Spectrum
              </button>
           </div>
        </div>

      </div>

      {showVisualizer && <ReportVisualizer data={{ totalUsers, totalGenerations, subscribedUsers, topLocations, featureUsage }} onClose={() => setShowVisualizer(false)} language={language} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend, color }) {
  const styles = {
    indigo: 'bg-indigo-50/50 text-indigo-600 border-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50/50 text-amber-600 border-amber-100 text-amber-600',
    rose: 'bg-rose-50/50 text-rose-600 border-rose-100 text-rose-600',
  };

  return (
    <div className={`p-10 rounded-[3.5rem] bg-white border border-slate-100 flex flex-col relative overflow-hidden group hover:scale-[1.03] transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]`}>
       <div className={`w-16 h-16 rounded-[1.5rem] ${styles[color]} border flex items-center justify-center mb-10 group-hover:rotate-6 transition-transform shadow-sm`}>
          <Icon size={28} />
       </div>
       <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-0.5">{label}</p>
            <h4 className="text-5xl font-black text-slate-900 tracking-tighter">{value}</h4>
          </div>
          <div className="text-right">
             <div className="flex items-center gap-1.5 justify-end">
                <span className={`text-[10px] font-black uppercase ${color === 'emerald' ? 'text-emerald-500' : 'text-slate-900'}`}>
                   {trend}
                </span>
                <IconTrendingUp size={12} className={color === 'emerald' ? 'text-emerald-500' : 'text-slate-900'} />
             </div>
             <p className="text-[10px] font-bold mt-2 text-slate-300 uppercase tracking-widest">{sub}</p>
          </div>
       </div>
       <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
          <Icon size={120} />
       </div>
    </div>
  );
}

function DistributionRow({ label, pct, count, color }) {
  return (
    <div className="space-y-2.5">
       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em]">
          <span className="text-slate-400 flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${color}`} />
             {label}
          </span>
          <span className="text-slate-900">{pct}% <span className="text-slate-300 ml-1">({count})</span></span>
       </div>
       <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
          <div className={`h-full ${color} rounded-full transition-all duration-[2000ms] ease-out shadow-sm`} style={{ width: `${pct}%` }} />
       </div>
    </div>
  );
}

function ReportVisualizer({ data, onClose, language }) {
  useEffect(() => {
    const canvas = document.getElementById('reportCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set high DPI resolution
    const dpr = 2;
    canvas.width = 800 * dpr;
    canvas.height = 1130 * dpr;
    ctx.scale(dpr, dpr);
 
    // Fill Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1130);
 
    // Header Gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 250);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 250);
 
    // Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 12px Inter, sans-serif';
    ctx.fillText('OFFICIAL ANALYTICS REPORT · NERAM AI', 60, 80);
 
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px Inter, sans-serif';
    ctx.fillText(language === 'en' ? 'Growth Analysis' : 'வளர்ச்சி பகுப்பாய்வு', 60, 140);
 
    ctx.font = '500 16px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`Timestamp: ${new Date().toLocaleString()} · Node Integrity Confirmed`, 60, 175);
 
    // Metrics Grid
    const drawMetric = (x, y, label, value, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, 160, 120, 24);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = '900 10px Inter';
      ctx.fillText(label.toUpperCase(), x + 20, y + 45);
      
      ctx.fillStyle = '#000000';
      ctx.font = '900 32px Inter';
      ctx.fillText(String(value), x + 20, y + 90);
    };
 
    drawMetric(60, 300, 'Total Nodes', data.totalUsers, '#e0e7ff');
    drawMetric(240, 300, 'Pulse Rate', data.totalGenerations, '#fef3c7');
    drawMetric(420, 300, 'Elite Tier', data.subscribedUsers, '#d1fae5');
    drawMetric(600, 300, 'Regions', data.topLocations.length, '#ffe4e6');
 
    // Feature Distribution Chart
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px Inter';
    ctx.fillText('Feature Affinity Distribution', 60, 500);
 
    const features = [
      { label: 'Pancha Pakshi', val: data.featureUsage.panchaPakshi, col: '#f59e0b' },
      { label: 'Nalla Neram', val: data.featureUsage.nallaNeram, col: '#6366f1' },
      { label: 'Downloads', val: data.featureUsage.downloads, col: '#f43f5e' }
    ];
 
    features.forEach((f, i) => {
      const y = 550 + (i * 85);
      const width = data.featureUsage.total > 0 ? (f.val / data.featureUsage.total) * 600 : 0;
      
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(60, y, 680, 50, 12);
      ctx.fill();
      
      ctx.fillStyle = f.col;
      ctx.beginPath();
      ctx.roundRect(60, y, Math.max(20, width), 50, 12);
      ctx.fill();
      
      ctx.fillStyle = '#475569';
      ctx.font = '900 14px Inter';
      ctx.fillText(f.label, 60, y - 10);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12px Inter';
      if (width > 60) ctx.fillText(`${f.val} Interactions`, 75, y + 31);
    });
 
    // Footer AI Content
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(60, 850, 680, 160, 32);
    ctx.fill();
 
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 12px Inter';
    ctx.fillText('ANALYTICAL SUMMARY', 95, 895);
 
    ctx.fillStyle = '#1e293b';
    ctx.font = '700 18px Inter';
    const conv = (data.subscribedUsers / data.totalUsers * 100).toFixed(1);
    const summaryText = `Ecosystem stability confirmed with a ${conv}% elite conversion rate. High velocity user retention identified.`;
    ctx.fillText(summaryText, 95, 930);
 
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 10px Inter';
    ctx.fillText('© 2026 NERAM ADVANCED ASTRO SOLUTIONS · ADMIN CONFIDENTIAL · TIER 4 DATA', 230, 1100);
 
  }, [data, language]);
 
  const downloadReport = () => {
    const canvas = document.getElementById('reportCanvas');
    const link = document.createElement('a');
    link.download = `neram_intel_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };
 
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-900/85 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[4.5rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.6)] w-full max-w-6xl h-[92vh] flex overflow-hidden border border-white/20 scale-95 md:scale-100 transition-all">
        
        {/* Settings Panel */}
        <div className="w-96 border-r border-slate-100 p-12 flex flex-col justify-between bg-slate-50/50">
           <div>
              <div className="flex items-center gap-5 mb-16">
                 <div className="w-16 h-16 rounded-[1.75rem] bg-slate-950 text-white flex items-center justify-center shadow-2xl">
                    <IconFileText size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">Visualizer</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">Export Node</p>
                 </div>
              </div>
              
              <div className="space-y-12">
                 <div>
                    <label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 block ml-1">Print Resolution</label>
                    <div className="grid grid-cols-1 gap-4">
                       <button className="flex items-center justify-between p-7 rounded-3xl border-2 border-slate-900 text-slate-900 font-black text-sm bg-white shadow-xl shadow-slate-900/5">
                          Ultra High Definition
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-900" />
                       </button>
                    </div>
                 </div>
                 
                 <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100/50 relative overflow-hidden">
                    <p className="text-xs font-bold text-indigo-900/60 leading-relaxed italic relative z-10">
                      "Real-time state capture ensures that your exported report reflects the most current environment intelligence."
                    </p>
                    <IconShieldCheck size={100} className="absolute -bottom-5 -right-5 text-indigo-500/5" />
                 </div>
              </div>
           </div>
 
           <div className="space-y-4">
              <button 
                onClick={downloadReport}
                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <IconDownload size={18} />
                {language === 'en' ? 'Commit Image' : 'பதிவிறக்கம்'}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-6 bg-white text-slate-400 border border-slate-100 rounded-[2.5rem] text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all font-bold"
              >
                {language === 'en' ? 'Close' : 'மூடு'}
              </button>
           </div>
        </div>
 
        {/* Canvas Area */}
        <div className="flex-1 bg-slate-100/80 p-12 overflow-y-auto flex items-start justify-center custom-scrollbar">
           <div className="shadow-[0_80px_150px_-40px_rgba(0,0,0,0.2)] origin-top scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-100 transition-transform bg-white border border-white">
              <canvas id="reportCanvas" style={{ width: '450px', height: '636px', background: '#fff' }} />
           </div>
        </div>
 
      </div>
    </div>
  );
}
