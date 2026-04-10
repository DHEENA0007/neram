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
        <div className="text-right">
            <p className="admin-page-sub">Welcome back, <strong>{user?.name || user?.username}</strong></p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">System Health: Optimal</p>
        </div>
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
          <Link to="/admin/users" className="dash-quick-card group">
            <span className="dash-quick-icon"><IconUserPlus size={22} /></span>
            <strong>Manage Users</strong>
            <span>Create & edit app users</span>
          </Link>
          <Link to="/admin/palangal" className="dash-quick-card group">
            <span className="dash-quick-icon"><IconList size={22} /></span>
            <strong>Configure Palangal</strong>
            <span>Setup prediction texts</span>
          </Link>
          <Link to="/admin/settings" className="dash-quick-card group">
            <span className="dash-quick-icon"><IconSettings size={22} /></span>
            <strong>Profile Settings</strong>
            <span>Update your credentials</span>
          </Link>
          <Link to="/user" className="dash-quick-card group">
            <span className="dash-quick-icon"><IconSun size={22} /></span>
            <strong>User Portal</strong>
            <span>View public schedule</span>
          </Link>
        </div>
      </div>

      <div className="dash-info">
        <h2 className="dash-section-title">System Status · கணினித் தகவல்</h2>
        <div className="ap-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '2rem', alignItems: 'center' }}>
          <div>
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              The Neram workstation is currently managing <strong className="text-slate-900">{total} users</strong> across the Panchapakshi platform. 
              The prediction engine is utilizing <strong className="text-slate-900">{palangalCount} active rules</strong> to generate sunrise-linked tables.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                   Last system health check: Just now. All services operational.
                </span>
            </div>
          </div>
          <div style={{ padding: '2rem', background: 'rgba(245,158,11,.05)', borderRadius: '2rem', textAlign: 'center', border: '1px solid rgba(245,158,11,.1)' }}>
            <IconInfo size={32} className="text-amber-500 mb-2 mx-auto" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">v1.2.0 Stable</div>
          </div>
        </div>
      </div>
    </div>
  );
}

