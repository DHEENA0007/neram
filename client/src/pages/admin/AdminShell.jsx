import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconList, IconSettings, IconDashboard, 
  IconLogout, IconArrowRight, IconZap, IconCreditCard,
  IconChartBar 
} from '../../components/Icons.jsx';

export function AdminShell() {
  const { user, logout, language } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50
        w-64 sm:w-72 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button (mobile only) */}
        <button 
          className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          onClick={() => setSidebarOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Branding */}
        <div className="p-5 sm:p-8 pb-6 sm:pb-10 flex items-center gap-3">
          <img src="/logo.png" alt="Sri Vinayaga Astro Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 leading-none tracking-tight">Sri Vinayaga Astro</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 sm:px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          
          <NavItem to="/admin" icon={IconDashboard} label="Dashboard" sub="முகப்பு" end onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/users" icon={IconUsers} label="Users" sub="பயனர்கள்" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/subscriptions" icon={IconCreditCard} label="Subscriptions" sub="சந்தா" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/reports" icon={IconChartBar} label="Reports" sub="அறிக்கைகள்" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/palangal" icon={IconList} label="Palangal" sub="பலன்கள்" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/settings" icon={IconSettings} label="Settings" sub="அமைப்புகள்" onNavigate={() => setSidebarOpen(false)} />
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50">
          {/* User Badge */}
          <div className="flex items-center gap-3 px-2 mb-3 sm:mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-black text-xs shrink-0">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-slate-900 truncate">{user?.name || 'Administrator'}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">System Admin</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5">
            <NavLink to="/user" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-all" onClick={() => setSidebarOpen(false)}>
              <IconArrowRight size={14} />
              <span>User Portal</span>
            </NavLink>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider hover:bg-rose-100 transition-all w-full"
            >
              <IconLogout size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-700 rounded-xl hover:bg-slate-100 transition-all shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
          <h1 className="text-sm font-black text-slate-900 tracking-tight">Admin</h1>
          <div className="flex-1" />
          <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-black text-[10px]">
            {user?.name ? user.name[0] : 'A'}
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, sub, end, onNavigate }) {
  const { language } = useAuth();
  return (
    <NavLink 
      to={to} 
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300
        ${isActive 
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className={isActive ? 'text-amber-400' : ''}>
             <Icon size={18} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs sm:text-sm font-black tracking-tight">{language === 'en' ? label : sub}</span>
          </div>
        </>
      )}
    </NavLink>
  );
}
