import { useEffect, useState } from 'react';
import { loadAdminUsers } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconActivity, IconCreditCard, IconCalendar, 
  IconDownload, IconChartBar, IconMapPin, IconTrendingUp,
  IconArrowRight
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
  const totalUsers = users.length;
  const subscribedUsers = users.filter(u => u.userType === 'subscribed').length;
  const trialUsers = users.filter(u => u.userType === 'demo').length;
  const totalGenerations = users.reduce((acc, u) => acc + (u.usageStats?.generationsCount || 0), 0);

  // Group locations globally
  const getGlobalLocations = () => {
    const locs = {};
    users.forEach(u => {
      Object.entries(u.usageStats?.locationFrequency || {}).forEach(([loc, count]) => {
        locs[loc] = (locs[loc] || 0) + count;
      });
    });
    return Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  };

  // Feature usage distribution
  const getFeatureUsage = () => {
    const usage = { panchaPakshi: 0, nallaNeram: 0, downloads: 0 };
    users.forEach(u => {
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
    const rows = users.map(u => [
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

  const T_TITLE = language === 'en' ? 'Data Intelligence' : 'தரவு பகுப்பாய்வு';
  const T_SUB = language === 'en' ? 'Advanced Analytics & Report Generation' : 'மேம்பட்ட பகுப்பாய்வு மற்றும் அறிக்கை உருவாக்கம்';

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
            onClick={exportCSV}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all"
           >
             <IconDownload size={18} />
             {language === 'en' ? 'Export CSV' : 'அறிக்கை தரவிறக்கம்'}
           </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard icon={IconUsers} label="Total Users" value={totalUsers} sub="+12% this month" color="indigo" />
         <MetricCard icon={IconCreditCard} label="Subscribed" value={subscribedUsers} sub={`${((subscribedUsers/totalUsers)*100).toFixed(1)}% Conversion`} color="emerald" />
         <MetricCard icon={IconActivity} label="Total Usage" value={totalGenerations} sub="Pancha Pakshi Hits" color="amber" />
         <MetricCard icon={IconTrendingUp} label="Reach" value={topLocations.length} sub="Unique Cities" color="rose" />
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
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Subscriber Intelligence</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{users.length} Records Analyzed</p>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Generations</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Downloads</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Join Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {users.sort((a,b) => (b.usageStats?.generationsCount || 0) - (a.usageStats?.generationsCount || 0)).slice(0, 10).map(u => (
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
    <div className={`p-8 rounded-[2.5rem] border ${styles[color]} flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all`}>
       <div className="mb-4">
          <Icon size={24} className="opacity-50" />
       </div>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <h4 className="text-4xl font-black">{value}</h4>
       <p className="text-[10px] font-bold mt-2 opacity-50 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function FeatureRatio({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-900">{pct.toFixed(1)}%</span>
       </div>
       <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden flex">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
       </div>
       <p className="text-[9px] font-bold text-slate-300 uppercase">{value.toLocaleString()} Interactions</p>
    </div>
  );
}
