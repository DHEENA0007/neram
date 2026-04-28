import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconList, IconSettings, IconDashboard, 
  IconLogout, IconArrowRight, IconZap, IconCreditCard,
  IconChartBar, IconX, IconArrowRight as IconMenu
} from '../../components/Icons.jsx';

export function AdminShell() {
  const { user, logout, language } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-sm font-bold text-slate-900">Astro Admin</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55]" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-[58]
        w-64 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Branding (Desktop) */}
        <div className="hidden lg:flex p-6 pb-8 items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Astro Admin</h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Management</p>
          </div>
        </div>

        {/* Padding for mobile header */}
        <div className="lg:hidden h-16" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 lg:py-0 space-y-1 overflow-y-auto">
          <NavItem to="/admin" icon={IconDashboard} label="Dashboard" sub="முகப்பு" end onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/users" icon={IconUsers} label="Users" sub="பயனர்கள்" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/subscriptions" icon={IconCreditCard} label="Subscriptions" sub="சந்தா" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/reports" icon={IconChartBar} label="Reports" sub="அறிக்கைகள்" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/palangal" icon={IconList} label="Palangal" sub="பலன்கள்" onNavigate={() => setSidebarOpen(false)} />
          <NavItem to="/admin/settings" icon={IconSettings} label="Settings" sub="அமைப்புகள்" onNavigate={() => setSidebarOpen(false)} />
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-1 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin'}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">System Root</span>
            </div>
          </div>

          <div className="space-y-1.5 text-center">
            <NavLink to="/user" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-all border border-amber-100/50" onClick={() => setSidebarOpen(false)}>
              <IconArrowRight size={14} />
              <span>User Portal</span>
            </NavLink>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-all w-full border border-rose-100/50"
            >
              <IconLogout size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-10 lg:pt-10 pt-20 overflow-y-auto">
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
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${isActive 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className={isActive ? 'text-amber-400' : ''}>
             <Icon size={18} />
          </div>
          <span className="text-xs font-semibold">{language === 'en' ? label : sub}</span>
        </>
      )}
    </NavLink>
  );
}
