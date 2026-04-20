import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function PortalShell({ title, children, lang, onToggleLang }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col">
      <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-3 gap-4">
        <div className="flex items-center gap-4 sm:gap-8 self-start sm:self-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-black text-amber-600">Neram</div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block" />

          <div className="hidden sm:block">
            <span className="text-[9px] font-black text-yellow-600 uppercase tracking-[0.2em] block leading-none mb-1 opacity-70">
              பஞ்சபட்சி சாஸ்திரம்
            </span>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          {/* USER INFO */}
          <div className="flex items-center gap-3 pr-4 sm:pr-6 border-r border-slate-100">
             <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm font-bold text-amber-700 uppercase shadow-sm">
                {(user?.name || user?.username)[0]}
             </div>
             <div className="flex flex-col">
               <strong className="text-[11px] text-slate-900 leading-none mb-1">{user?.name || user?.username}</strong>
               <div className="flex items-center gap-2 leading-none">
                 <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Authenticated</span>
                 <span className="w-1 h-1 rounded-full bg-emerald-500" />
                 <span className={`text-[8px] font-black uppercase tracking-widest ${user?.role === 'admin' ? 'text-amber-600' : 'text-slate-500'}`}>
                   {user?.role}
                 </span>
               </div>
             </div>
          </div>

          <nav className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {onToggleLang && (
              <button className="btn-ghost shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-slate-50" type="button" onClick={onToggleLang}>
                {lang === 'ta' ? 'English' : 'தமிழ்'}
              </button>
            )}
            <NavLink 
              className={({ isActive }) => 
                `px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
              } 
              to="/user"
            >
              {lang === 'ta' ? 'பஞ்சபட்சி' : 'Schedule'}
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
                } 
                to="/admin"
              >
                {lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
              </NavLink>
            )}
            <button className="btn-ghost shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl" type="button" onClick={logout}>
              {lang === 'ta' ? 'வெளியேறு' : 'Logout'}
            </button>
          </nav>
        </div>
      </header>

      <main className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
