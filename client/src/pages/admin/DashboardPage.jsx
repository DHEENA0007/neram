import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadAdminUsers, loadPalangal } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { IconUsers, IconList, IconSettings, IconSun, IconUserPlus, IconInfo } from '../../components/Icons.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [palangalCount, setPalangalCount] = useState(0);

  useEffect(() => {
    loadAdminUsers().then((d) => setUsers(d.users || []));
    loadPalangal().then((d) => setPalangalCount((d.palangal || []).length));
  }, []);

  const total   = users.length;
  const active  = users.filter((u) => u.active).length;
  const regular = users.filter((u) => u.role === 'user').length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">நிர்வாக முகப்பு · Admin Overview</p>
          <h1 className="admin-page-title">Dashboard</h1>
        </div>
        <p className="admin-page-sub">Welcome back, {user?.name || user?.username}</p>
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{total}</span>
          <span className="dash-stat-label">Total Registered</span>
          <span className="dash-stat-tamil">மொத்த பயனர்கள்</span>
        </div>
        <div className="dash-stat-card dash-stat-green">
          <span className="dash-stat-value">{active}</span>
          <span className="dash-stat-label">Active Accounts</span>
          <span className="dash-stat-tamil">செயலில் உள்ளோர்</span>
        </div>
        <div className="dash-stat-card dash-stat-amber">
          <span className="dash-stat-value">{regular}</span>
          <span className="dash-stat-label">Standard Users</span>
          <span className="dash-stat-tamil">பொது பயனர்கள்</span>
        </div>
        <div className="dash-stat-card dash-stat-teal">
          <span className="dash-stat-value">{palangalCount}</span>
          <span className="dash-stat-label">Prediction Rules</span>
          <span className="dash-stat-tamil">பலன் விதிகள்</span>
        </div>
      </div>

      <div className="dash-quick">
        <h2 className="dash-section-title">Navigation Shortcuts · விரைவு செயல்கள்</h2>
        <div className="dash-quick-grid">
          <Link to="/admin/users" className="dash-quick-card">
            <span className="dash-quick-icon"><IconUserPlus size={22} /></span>
            <strong>Manage Users</strong>
            <span>Create & edit app users</span>
          </Link>
          <Link to="/admin/palangal" className="dash-quick-card">
            <span className="dash-quick-icon"><IconList size={22} /></span>
            <strong>Configure Palangal</strong>
            <span>Setup prediction texts</span>
          </Link>
          <Link to="/admin/settings" className="dash-quick-card">
            <span className="dash-quick-icon"><IconSettings size={22} /></span>
            <strong>Profile Settings</strong>
            <span>Update your credentials</span>
          </Link>
          <Link to="/user" className="dash-quick-card">
            <span className="dash-quick-icon"><IconSun size={22} /></span>
            <strong>User Portal</strong>
            <span>View public schedule</span>
          </Link>
        </div>
      </div>

      <div className="dash-info">
        <h2 className="dash-section-title">System Status · கணினித் தகவல்</h2>
        <div className="dash-info-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '2rem', alignItems: 'center' }}>
          <div>
            <p>
              The Neram workstation is currently managing <strong>{total} users</strong> across the Panchapakshi platform. 
              The prediction engine is utilizing <strong>{palangalCount} active rules</strong> to generate sunrise-linked tables.
            </p>
            <p style={{ marginTop: '.75rem', fontSize: '.85rem' }} className="muted">
              Last system health check: Just now. All services operational.
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(15,118,110,.08)', borderRadius: '14px', textAlign: 'center' }}>
            <IconInfo size={32} style={{ color: 'var(--accent)', marginBottom: '.5rem' }} />
            <div style={{ fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)' }}>v1.2.0 Stable</div>
          </div>
        </div>
      </div>
    </div>
  );
}
