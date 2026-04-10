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
        <div className="text-right">
            <p className="admin-page-sub">Security & Identity Management</p>
        </div>
      </div>

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        {/* Profile info card */}
        <div className="ap-card settings-profile-card">
          <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center text-4xl font-black text-amber-950 mx-auto mb-6 shadow-xl shadow-amber-500/20">
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="text-center">
            <strong className="text-xl text-slate-900 block">{user?.name || user?.username}</strong>
            <span className="text-sm text-slate-400 font-medium">@{user?.username}</span>
            <div className="mt-4 flex justify-center">
              <span className="role-chip role-admin flex items-center gap-2">
                <IconShield size={12} />
                System Administrator
              </span>
            </div>
          </div>
          
          <div className="mt-10 space-y-4 pt-8 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Level</span>
              <span className="text-xs font-black text-slate-900">ROOT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
              <span className="status-on flex items-center gap-1.5 text-xs">
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

            <div className="py-4 flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Security Credentials</span>
                <div className="h-px w-full bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ap-field">
                    <label>New Administrative Password</label>
                    <input
                        className="text-input"
                        type="password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="Leave blank to maintain"
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
            </div>

            {error   && <div className="ap-error">{error}</div>}
            {success && <div className="ap-success">{success}</div>}

            <div className="flex justify-end mt-8">
                <button className="primary-button" type="submit" disabled={saving} style={{ width: 'auto' }}>
                    {saving ? 'Applying Updates...' : 'Synchronize Profile'}
                </button>
            </div>
          </form>
          
          <div className="mt-10 p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl text-[11px] text-amber-900/60 leading-relaxed flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <IconShield size={18} className="text-amber-600" />
             </div>
             <p>
                <strong>Security Alert:</strong> Changing your password will not end your current session, but will require re-authentication on other devices to ensure system integrity.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

