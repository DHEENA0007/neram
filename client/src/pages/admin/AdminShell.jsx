import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';
import {
  IconDashboard, IconUsers, IconList,
  IconSettings, IconArrowRight, IconLogout,
} from '../../components/Icons.jsx';

const NAV = [
  { to: 'dashboard', label: 'Dashboard', tamil: 'முகப்பு',      Icon: IconDashboard },
  { to: 'users',     label: 'Users',     tamil: 'பயனர்கள்',     Icon: IconUsers },
  { to: 'palangal',  label: 'Palangal',  tamil: 'பலன்கள்',      Icon: IconList },
  { to: 'settings',  label: 'Settings',  tamil: 'அமைப்புகள்',   Icon: IconSettings },
];

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-avatar">N</div>
          <div>
            <span className="sidebar-brand-name">Neram</span>
            <span className="sidebar-brand-sub">Admin Portal</span>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">{(user?.name || 'A')[0].toUpperCase()}</div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{user?.name || user?.username}</div>
            <div className="sidebar-profile-role">நிர்வாகி · System Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">General Control</p>
          {NAV.map(({ to, label, tamil, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link group${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon"><Icon size={20} /></span>
              <span className="sidebar-link-labels">
                <span className="sidebar-link-en">{label}</span>
                <span className="sidebar-link-ta">{tamil}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/user" className="sidebar-link sidebar-link-secondary group">
            <span className="sidebar-link-icon"><IconArrowRight size={18} /></span>
            <span className="sidebar-link-labels">
              <span className="sidebar-link-en">Switch to User Portal</span>
              <span className="sidebar-link-ta">பயனர் பக்கம் செல்க</span>
            </span>
          </NavLink>
          <button className="sidebar-link sidebar-link-danger group" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>
            <span className="sidebar-link-icon"><IconLogout size={18} /></span>
            <span className="sidebar-link-labels">
              <span className="sidebar-link-en">Logout Session</span>
              <span className="sidebar-link-ta">வெளியேறு</span>
            </span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

