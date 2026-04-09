import { useState } from 'react';
import { updateAdminProfile } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { IconShield, IconCheckCircle } from '../../components/Icons.jsx';

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName]   = useState(user?.name || '');
  const [pwd,  setPwd]    = useState('');
  const [pwd2, setPwd2]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [success, setSuccess] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (pwd && pwd !== pwd2) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload = { name };
      if (pwd) payload.password = pwd;
      await updateAdminProfile(payload);
      await refresh();
      setPwd(''); setPwd2('');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">சுயவிவர அமைப்புகள் · Admin Profile</p>
          <h1 className="admin-page-title">Settings</h1>
        </div>
        <p className="admin-page-sub">Security & Identity Management</p>
      </div>

      <div className="settings-grid">
        {/* Profile info card */}
        <div className="ap-card settings-profile-card">
          <div className="settings-avatar-big" style={{ borderRadius: '20px' }}>
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="settings-profile-info">
            <strong>{user?.name || user?.username}</strong>
            <span className="ap-muted">@{user?.username}</span>
            <div style={{ marginTop: '.75rem' }}>
              <span className="role-chip role-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                <IconShield size={12} />
                System Administrator
              </span>
            </div>
          </div>
          
          <div className="settings-meta" style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,.03)', padding: '1rem', borderRadius: '12px' }}>
            <div className="settings-meta-row">
              <span className="ap-muted">Access Level</span>
              <span style={{ fontWeight: 700 }}>Full (Root)</span>
            </div>
            <div className="settings-meta-row" style={{ marginTop: '.5rem' }}>
              <span className="ap-muted">Account Status</span>
              <span className="status-on" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <IconCheckCircle size={14} /> Active
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="ap-card">
          <div className="ap-card-head">
            <p className="ap-eyebrow">தகவல்களைத் திருத்து</p>
            <h2>Identity & Security</h2>
          </div>
          <form className="ap-form" onSubmit={handleSave}>
            <div className="ap-field">
              <label>Administrator Display Name</label>
              <input
                className="text-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>

            <div className="ap-section-divider" style={{ margin: '1rem 0' }}>
              <span>Security Credentials</span>
            </div>

            <div className="ap-field">
              <label>New Administrative Password</label>
              <input
                className="text-input"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Leave blank to maintain current"
              />
            </div>
            <div className="ap-field">
              <label>Confirm Administrative Password</label>
              <input
                className="text-input"
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            {error   && <div className="ap-error">{error}</div>}
            {success && <div className="ap-success">{success}</div>}

            <button className="primary-button" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
              {saving ? 'Applying Updates...' : 'Synchronize Profile'}
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(180,83,9,.2)', background: 'rgba(180,83,9,.05)', borderRadius: '12px', fontSize: '.82rem', color: '#92400e' }}>
            <strong>Security Alert:</strong> Changing your password will not end your current session, but will require re-authentication on other devices.
          </div>
        </div>
      </div>
    </div>
  );
}
