import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function PortalShell({ title, children, lang, onToggleLang }) {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col">
      <header className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 sm:px-8 py-2.5 sm:py-3 gap-2">
          {/* Logo + title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <img src="/logo.png" alt="Sri Vinayaga Astro Logo" className="h-8 sm:h-10 w-auto object-contain shrink-0" />
            <div className="hidden sm:block">
              <span className="text-[9px] font-black text-yellow-600 uppercase tracking-[0.2em] block leading-none mb-1 opacity-70">
                பஞ்சபட்சி சாஸ்திரம்
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">{title}</h1>
            </div>
          </div>

          {/* Desktop nav + user (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6">
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

            <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
              {onToggleLang && (
                <button className="btn-ghost shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-slate-50" type="button" onClick={onToggleLang}>
                  {lang === 'ta' ? 'English' : 'தமிழ்'}
                </button>
              )}
              <NavLink
                className={({ isActive }) =>
                  `px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
                }
                to="/user"
              >
                {lang === 'ta' ? 'பஞ்சபட்சி' : 'Schedule'}
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
                }
                to="/nalla-neram"
              >
                {lang === 'ta' ? 'நல்ல நேரம்' : 'Nalla Neram'}
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-indigo-100 text-indigo-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
                }
                to="/branding"
              >
                {lang === 'ta' ? 'பிராண்டிங்' : 'Branding'}
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink 
                  className={({ isActive }) => 
                    `px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
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

          {/* Mobile: user avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {onToggleLang && (
              <button className="text-[9px] font-black uppercase tracking-widest px-2 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" type="button" onClick={onToggleLang}>
                {lang === 'ta' ? 'EN' : 'த'}
              </button>
            )}
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-xs font-bold text-amber-700 uppercase shadow-sm">
              {(user?.name || user?.username)[0]}
            </div>
            <button 
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="w-9 h-9 flex items-center justify-center text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
            >
              {mobileNavOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/98 px-3 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm font-bold text-amber-700 uppercase shadow-sm">
                {(user?.name || user?.username)[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <strong className="text-[11px] text-slate-900 leading-none mb-1 truncate">{user?.name || user?.username}</strong>
                <span className={`text-[8px] font-black uppercase tracking-widest ${user?.role === 'admin' ? 'text-amber-600' : 'text-slate-500'}`}>
                  {user?.role}
                </span>
              </div>
            </div>

            <NavLink
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
              }
              to="/user"
              onClick={() => setMobileNavOpen(false)}
            >
              {lang === 'ta' ? 'பஞ்சபட்சி' : 'Schedule'}
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
              }
              to="/nalla-neram"
              onClick={() => setMobileNavOpen(false)}
            >
              {lang === 'ta' ? 'நல்ல நேரம்' : 'Nalla Neram'}
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-indigo-100 text-indigo-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
              }
              to="/branding"
              onClick={() => setMobileNavOpen(false)}
            >
              {lang === 'ta' ? 'பிராண்டிங்' : 'Branding'}
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink 
                className={({ isActive }) => 
                  `block px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
                } 
                to="/admin"
                onClick={() => setMobileNavOpen(false)}
              >
                {lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
              </NavLink>
            )}
            <button 
              className="w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all" 
              type="button" 
              onClick={() => { setMobileNavOpen(false); logout(); }}
            >
              {lang === 'ta' ? 'வெளியேறு' : 'Logout'}
            </button>
          </div>
        )}
      </header>

      <main className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 flex-1">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
