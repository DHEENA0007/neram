import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import { 
  IconUsers, IconList, IconSettings, IconDashboard, 
  IconLogout, IconArrowRight, IconZap, IconCreditCard 
} from '../../components/Icons.jsx';

export function AdminShell() {
  const { user, logout, language } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-50">
        
        {/* Branding */}
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <IconZap size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">Neram</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          
          <NavItem to="/admin" icon={IconDashboard} label="Dashboard" sub="முகப்பு" end />
          <NavItem to="/admin/users" icon={IconUsers} label="Users" sub="பயனர்கள்" />
          <NavItem to="/admin/subscriptions" icon={IconCreditCard} label="Subscriptions" sub="சந்தா" />
          <NavItem to="/admin/palangal" icon={IconList} label="Palangal" sub="பலன்கள்" />
          <NavItem to="/admin/settings" icon={IconSettings} label="Settings" sub="அமைப்புகள்" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {/* User Badge */}
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 font-black text-xs">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-slate-900 truncate">{user?.name || 'Administrator'}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">System Admin</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5">
            <NavLink to="/user" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-all">
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
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, sub, end }) {
  const { language } = useAuth();
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300
        ${isActive 
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className={isActive ? 'text-amber-400' : ''}>
             <Icon size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-black tracking-tight">{language === 'en' ? label : sub}</span>
          </div>
        </>
      )}
    </NavLink>
  );
}
