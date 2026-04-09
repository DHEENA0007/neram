import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function PortalShell({ title, children, lang, onToggleLang }) {
  const { user, logout } = useAuth();

  return (
    <div className="portal-shell">
      <header className="topbar">
        <div>
          <div className="brand">Neram</div>
        </div>
        <nav className="topbar-nav">
          {onToggleLang && (
            <button className="ghost-button lang-btn" type="button" onClick={onToggleLang}>
              {lang === 'ta' ? 'English' : 'தமிழ்'}
            </button>
          )}
          <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/user">
            {lang === 'ta' ? 'பஞ்சபட்சி' : 'Schedule'}
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/admin">
              {lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
            </NavLink>
          )}
          <button className="ghost-button" type="button" onClick={logout}>
            {lang === 'ta' ? 'வெளியேறு' : 'Logout'}
          </button>
        </nav>
      </header>

      <main className="portal-main">
        <div className="hero-panel">
          <div>
            <span className="eyebrow">பஞ்சபட்சி சாஸ்திரம்</span>
            <h1>{title}</h1>
          </div>
          <div className="hero-user">
            <span className="hero-user-label">Signed in as</span>
            <strong>{user?.name || user?.username}</strong>
            <span className={`role-chip ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
