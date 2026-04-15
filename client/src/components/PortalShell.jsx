import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function PortalShell({ title, children, lang, onToggleLang }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-2">
          <div className="text-lg font-black text-amber-600">Neram</div>
        </div>
        <nav className="flex items-center gap-2">
          {onToggleLang && (
            <button className="btn-ghost" type="button" onClick={onToggleLang}>
              {lang === 'ta' ? 'English' : 'தமிழ்'}
            </button>
          )}
          <NavLink 
            className={({ isActive }) => 
              `px-4 py-2 rounded-full text-sm font-bold transition-colors ${isActive ? 'bg-yellow-400 text-yellow-950' : 'text-slate-600 hover:bg-slate-100'}`
            } 
            to="/user"
          >
            {lang === 'ta' ? 'பஞ்சபட்சி' : 'Schedule'}
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink 
              className={({ isActive }) => 
                `px-4 py-2 rounded-full text-sm font-bold transition-colors ${isActive ? 'bg-yellow-400 text-yellow-950' : 'text-slate-600 hover:bg-slate-100'}`
              } 
              to="/admin"
            >
              {lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
            </NavLink>
          )}
          <button className="btn-ghost" type="button" onClick={logout}>
            {lang === 'ta' ? 'வெளியேறு' : 'Logout'}
          </button>
        </nav>
      </header>

      <main className="w-full max-w-screen-2xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
          <div>
            <span className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-1 block opacity-70">
              பஞ்சபட்சி சாஸ்திரம்
            </span>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-4 bg-white/50 p-2 pr-4 rounded-2xl border border-white/50">
             <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-lg font-bold text-yellow-700 uppercase">
               {(user?.name || user?.username)[0]}
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Authenticated</span>
               <strong className="text-slate-900 leading-none">{user?.name || user?.username}</strong>
             </div>
             <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${user?.role === 'admin' ? 'bg-yellow-400 text-yellow-950' : 'bg-slate-200 text-slate-600'}`}>
               {user?.role}
             </span>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
