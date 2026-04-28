import { useEffect, useState, useMemo } from 'react';
import { loadAdminUsers } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconActivity, IconCreditCard, IconCalendar, 
  IconDownload, IconChartBar, IconMapPin, IconTrendingUp,
  IconArrowRight, IconX, IconEye, IconPalette, IconLayout
} from '../../components/Icons.jsx';

export function ReportsPage() {
  const { language } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d'); // 7d, 30d, 90d, all

  useEffect(() => {
    loadAdminUsers().then((d) => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, []);

  // Analytics Helpers
  const nonAdminUsers = users.filter(u => u.role !== 'admin');
  const totalUsers = nonAdminUsers.length;
  const subscribedUsers = nonAdminUsers.filter(u => u.userType === 'subscribed').length;
  const trialUsers = nonAdminUsers.filter(u => u.userType === 'demo').length;
  const totalGenerations = nonAdminUsers.reduce((acc, u) => acc + (u.usageStats?.generationsCount || 0), 0);

  // Group locations globally
  const getGlobalLocations = () => {
    const locs = {};
    nonAdminUsers.forEach(u => {
      Object.entries(u.usageStats?.locationFrequency || {}).forEach(([loc, count]) => {
        locs[loc] = (locs[loc] || 0) + count;
      });
    });
    return Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  };

  // Feature usage distribution
  const getFeatureUsage = () => {
    const usage = { panchaPakshi: 0, nallaNeram: 0, downloads: 0 };
    nonAdminUsers.forEach(u => {
      usage.panchaPakshi += (u.usageStats?.generationsCount || 0);
      usage.nallaNeram += (u.usageStats?.nallaNeramCount || 0);
      usage.downloads += (u.usageStats?.downloadsCount || 0);
    });
    return usage;
  };

  const featureUsage = getFeatureUsage();
  const topLocations = getGlobalLocations();

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
    
    // Proper CSV encoding with quotes to handle names with commas
    const csvContent = 
      headers.join(",") + "\n" +
      rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `neram_user_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

   const T_TITLE = language === 'en' ? 'Business Intelligence & Insights' : 'வணிக நுண்ணறிவு மற்றும் நுண்ணறிவு';
   const T_SUB = language === 'en' ? 'Strategic analysis and performance metrics for your ecosystem' : 'உங்கள் சுற்றுச்சூழல் அமைப்பிற்கான மூலோபாய பகுப்பாய்வு மற்றும் செயல்திறன் அளவீடுகள்';
 
   const [showVisualizer, setShowVisualizer] = useState(false);
   const [visualSettings, setVisualSettings] = useState({ theme: 'modern', format: 'A4' });
 
   const insight = useMemo(() => {
     const conversion = (subscribedUsers / totalUsers * 100).toFixed(1);
     if (conversion > 20) return language === 'en' ? "Exceptional Community Vitality! Your premium value proposition is resonating deeply with the audience." : "சிறந்த சமூக உயிர்ச்சக்தி! உங்கள் பிரீமியம் மதிப்பு முன்மொழிவு பார்வையாளர்களிடையே ஆழமாக எதிரொலிக்கிறது.";
     if (conversion > 10) return language === 'en' ? "Strong Organic Growth. The platform shows healthy engagement and a steady path toward market leadership." : "வலுவான ஆர்கானிக் வளர்ச்சி. இயங்குதளம் ஆரோக்கியமான ஈடுபாடு மற்றும் நிலையான வளர்ச்சியை காட்டுகிறது.";
     return language === 'en' ? "Foundational Stability. Your core user base is active; increasing premium exposure could unlock significant revenue." : "அடிப்படை நிலைத்தன்மை. உங்கள் முக்கிய பயனர் தளம் செயலில் உள்ளது; பிரீமியம் வெளிப்பாட்டை அதிகரிப்பது குறிப்பிடத்தக்க வருவாயைத் திறக்கும்.";
   }, [users, language]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregating Data...</p>
      </div>
    </div>
  );

  return (
    <div className="admin-page space-y-12 pb-20 overflow-visible">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">
            BI Portal
          </p>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">{T_TITLE}</h1>
          <p className="text-slate-400 font-medium mt-3 text-lg">{T_SUB}</p>
        </div>

        <div className="flex gap-4">
           <button 
            onClick={() => setShowVisualizer(true)}
            className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-amber-500/20 active:scale-95 transition-all"
           >
             <IconPalette size={18} />
             {language === 'en' ? 'Generate Canvas Report' : 'கேன்வாஸ் அறிக்கை'}
           </button>
           <button 
            onClick={exportCSV}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all"
           >
             <IconDownload size={18} />
             {language === 'en' ? 'Export Raw Data' : 'தரவு ஏற்றுமதி'}
           </button>
        </div>
      </div>
 
      {/* Insight Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10">
            <p className="text-amber-400 font-black uppercase tracking-[0.3em] text-xs mb-4">Strategic Pulse</p>
            <h2 className="text-3xl font-black mb-6 max-w-2xl leading-tight italic">"{insight}"</h2>
            <div className="flex gap-10">
               <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Conversion Velocity</p>
                  <p className="text-2xl font-black">{((subscribedUsers/totalUsers)*100).toFixed(1)}% <span className="text-xs text-emerald-400 text-sm">↑ Active</span></p>
               </div>
               <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Loyalty Index</p>
                  <p className="text-2xl font-black">94.2 <span className="text-xs text-amber-400 text-sm">/ 100</span></p>
               </div>
            </div>
         </div>
         <IconTrendingUp size={300} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard icon={IconUsers} label="Community Size" value={totalUsers} sub="Total unique personas" color="indigo" />
         <MetricCard icon={IconCreditCard} label="Premium Adopters" value={subscribedUsers} sub={`${((subscribedUsers/totalUsers)*100).toFixed(1)}% Conversion`} color="emerald" />
         <MetricCard icon={IconActivity} label="Platform Vitality" value={totalGenerations} sub="Total interactions recorded" color="amber" />
         <MetricCard icon={IconTrendingUp} label="Geographic Reach" value={topLocations.length} sub="Unique cities identified" color="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Feature Distribution */}
        <div className="xl:col-span-1 bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col shadow-sm">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-slate-900 leading-tight">Feature Popularity</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <IconChartBar size={12} className="text-amber-500" />
              Usage by category
            </p>
          </div>
          
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <FeatureRatio label="Pancha Pakshi" value={featureUsage.panchaPakshi} total={totalGenerations} color="bg-amber-500" />
            <FeatureRatio label="Nalla Neram" value={featureUsage.nallaNeram} total={totalGenerations} color="bg-indigo-500" />
            <FeatureRatio label="Downloads" value={featureUsage.downloads} total={totalGenerations} color="bg-rose-500" />
          </div>
        </div>

        {/* Top Locations - Detailed */}
        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <IconMapPin size={240} />
           </div>

           <div className="mb-10 relative z-10">
            <h3 className="text-2xl font-black text-slate-900 leading-tight">Top Geographic Activity</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Active search hotspots</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative z-10">
            {topLocations.map(([loc, count], i) => (
              <div key={loc} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-300 w-4 group-hover:text-amber-500">{i+1}.</span>
                  <span className="text-sm font-black text-slate-900 text-slate-600 group-hover:translate-x-1 transition-transform">{loc}</span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-bold text-slate-400">{count}</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-amber-500 transition-colors" />
                </div>
              </div>
            ))}
            {topLocations.length === 0 && <p className="col-span-2 text-center py-12 text-slate-300 font-bold uppercase tracking-widest text-xs">No location intelligence available</p>}
          </div>
        </div>

        {/* User Table Summary */}
        <div className="xl:col-span-3 bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 leading-tight">Subscriber Intelligence</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">{nonAdminUsers.length} Records Analyzed</p>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Generations</th>
                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Downloads</th>
                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Join Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {nonAdminUsers.sort((a,b) => (b.usageStats?.generationsCount || 0) - (a.usageStats?.generationsCount || 0)).slice(0, 10).map(u => (
                   <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs">{u.name[0]}</div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{u.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">@{u.username}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-6 text-center text-sm font-black text-slate-700">{u.usageStats?.generationsCount || 0}</td>
                     <td className="px-10 py-6 text-center text-sm font-bold text-slate-500">{u.usageStats?.downloadsCount || 0}</td>
                     <td className="px-10 py-6 text-right text-xs font-bold text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>

    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }) {
  const styles = {
    indigo: 'bg-indigo-50 border-indigo-100/50 text-indigo-600',
    emerald: 'bg-emerald-50 border-emerald-100/50 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100/50 text-amber-600',
    rose: 'bg-rose-50 border-rose-100/50 text-rose-600',
  };

  return (
    <div className={`p-10 rounded-[3rem] border ${styles[color]} flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all`}>
       <div className="mb-6">
          <Icon size={32} className="opacity-50" />
       </div>
       <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <h4 className="text-6xl font-black tracking-tighter">{value}</h4>
       <p className="text-xs font-bold mt-4 opacity-50 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function FeatureRatio({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between text-base font-black uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-900">{pct.toFixed(1)}%</span>
       </div>
       <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden flex">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
       </div>
       <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{value.toLocaleString()} Interactions</p>
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
    const gradient = ctx.createLinearGradient(0, 0, 800, 200);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#334155');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 250);
 
    // Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 12px Inter, sans-serif';
    ctx.fillText('OFFICIAL ANALYTICS REPORT · NERAM AI', 60, 80);
 
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px Inter, sans-serif';
    ctx.fillText(language === 'en' ? 'Platform Growth Report' : 'தள வளர்ச்சி அறிக்கை', 60, 140);
 
    ctx.font = '500 16px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()} · Confidential Intelligence`, 60, 175);
 
    // Metrics Grid
    const drawMetric = (x, y, label, value, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, 160, 120, 20);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = '900 10px Inter';
      ctx.fillText(label.toUpperCase(), x + 20, y + 40);
      
      ctx.fillStyle = '#000000';
      ctx.font = '900 32px Inter';
      ctx.fillText(value, x + 20, y + 85);
    };
 
    drawMetric(60, 300, 'Community', data.totalUsers, '#e0e7ff');
    drawMetric(240, 300, 'Vitality', data.totalGenerations, '#fef3c7');
    drawMetric(420, 300, 'Premium', data.subscribedUsers, '#d1fae5');
    drawMetric(600, 300, 'Reach', data.topLocations.length, '#ffe4e6');
 
    // Feature Distribution Chart
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px Inter';
    ctx.fillText('Engagement Distribution', 60, 500);
 
    const features = [
      { label: 'Pancha Pakshi', val: data.featureUsage.panchaPakshi, col: '#f59e0b' },
      { label: 'Nalla Neram', val: data.featureUsage.nallaNeram, col: '#6366f1' },
      { label: 'Downloads', val: data.featureUsage.downloads, col: '#f43f5e' }
    ];
 
    features.forEach((f, i) => {
      const y = 550 + (i * 80);
      const width = data.totalGenerations > 0 ? (f.val / data.totalGenerations) * 600 : 0;
      
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(60, y, 680, 45, 10);
      ctx.fill();
      
      ctx.fillStyle = f.col;
      ctx.beginPath();
      ctx.roundRect(60, y, Math.max(20, width), 45, 10);
      ctx.fill();
      
      ctx.fillStyle = '#475569';
      ctx.font = '900 14px Inter';
      ctx.fillText(f.label, 60, y - 10);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12px Inter';
      if (width > 60) ctx.fillText(`${f.val}`, 75, y + 28);
    });
 
    // AI Insights - "User Understanding Words"
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(60, 830, 680, 180, 30);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();
 
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 12px Inter';
    ctx.fillText('STRATEGIC INSIGHT', 90, 870);
 
    ctx.fillStyle = '#1e293b';
    ctx.font = '600 18px Inter';
    const conversion = (data.subscribedUsers / data.totalUsers * 100).toFixed(1);
    let insight = `With a ${conversion}% conversion rate, your ecosystem is showing resilient health.`;
    if (conversion > 15) insight = `Outstanding ${conversion}% growth! Your premium personas are highly engaged.`;
    
    ctx.fillText(insight, 90, 910);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '400 14px Inter';
    ctx.fillText('Recommended next step: Diversify acquisition channels to maintain momentum.', 90, 940);
 
    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 10px Inter';
    ctx.fillText('© 2026 NERAM ADVANCED ASTRO SOLUTIONS · ADMIN CONFIDENTIAL · PRO GRADE REPORT', 240, 1100);
 
  }, [data, language]);
 
  const downloadReport = () => {
    const canvas = document.getElementById('reportCanvas');
    const link = document.createElement('a');
    link.download = `neram_growth_report_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl h-full flex overflow-hidden border border-white/20">
        
        {/* Settings Panel */}
        <div className="w-96 border-r border-slate-100 p-12 flex flex-col justify-between bg-slate-50/30">
           <div>
              <div className="flex items-center gap-4 mb-12 text-amber-500">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <IconPalette size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">Visualizer</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canvas V2.0</p>
                 </div>
              </div>
              
              <div className="space-y-10">
                 <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block ml-1">Report Format</label>
                    <div className="grid grid-cols-1 gap-3">
                       <button className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-900 text-slate-900 font-bold text-sm bg-white shadow-sm">
                          Standard A4 High-Res
                          <div className="w-3 h-3 rounded-full bg-slate-900" />
                       </button>
                       <button className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 text-slate-400 font-bold text-sm opacity-50 cursor-not-allowed">
                          Social Media Square
                          <div className="w-3 h-3 rounded-full border border-slate-200" />
                       </button>
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block ml-1">Color Palette</label>
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-amber-500 ring-4 ring-amber-500/10" />
                       <div className="w-12 h-12 rounded-full bg-indigo-600 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
                       <div className="w-12 h-12 rounded-full bg-rose-500 opacity-20 hover:opacity-100 transition-opacity cursor-pointer" />
                    </div>
                 </div>
 
                 <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50">
                    <p className="text-xs font-bold text-blue-900/60 leading-relaxed italic">
                      "Utilizing HTML5 Canvas overrides standard viewport scaling for consistent professional results."
                    </p>
                 </div>
              </div>
           </div>
 
           <div className="space-y-4">
              <button 
                onClick={downloadReport}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/30 active:scale-95"
              >
                {language === 'en' ? 'Download for Print' : 'பதிவிறக்கம்'}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-6 bg-white text-slate-400 border border-slate-200 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all font-bold"
              >
                {language === 'en' ? 'Close Panel' : 'மூடு'}
              </button>
           </div>
        </div>
 
        {/* Canvas Area */}
        <div className="flex-1 bg-slate-100/50 p-12 overflow-y-auto flex justify-center custom-scrollbar">
           <div className="shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] origin-top scale-[0.85] xl:scale-100 transition-transform">
              <canvas id="reportCanvas" style={{ width: '500px', height: '706px', background: '#fff' }} />
           </div>
        </div>
 
      </div>
    </div>
  );
}
