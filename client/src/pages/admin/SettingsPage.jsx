import { useState } from 'react';
import { updateAdminProfile } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { IconShield, IconCheckCircle, IconZap, IconLock } from '../../components/Icons.jsx';

export function SettingsPage() {
  const { user, refresh, language, setLanguage } = useAuth();
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
      setError(language === 'en' ? 'Passwords do not match.' : 'கடவுச்சொற்கள் பொருந்தவில்லை.');
      return;
    }

    setSaving(true);
    try {
      const payload = { name };
      if (pwd) payload.password = pwd;
      await updateAdminProfile(payload);
      await refresh();
      setPwd(''); setPwd2('');
      setSuccess(language === 'en' ? 'Profile updated successfully.' : 'சுயவிவரம் புதுப்பிக்கப்பட்டது.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const T_HEAD  = language === 'en' ? 'சுயவிவரம் · My Account' : 'எனது கணக்கு';
  const T_TITLE = language === 'en' ? 'Settings' : 'அமைப்புகள்';
  const T_NAME  = language === 'en' ? 'Administrator Display Name' : 'நிர்வாகியின் பெயர்';
  const T_PREF  = language === 'en' ? 'Preferences' : 'விருப்பத்தேர்வுகள்';
  const T_CRED  = language === 'en' ? 'Credentials' : 'அடையாளச் சான்றுகள்';
  const T_SAVE  = language === 'en' ? 'Synchronize Profile' : 'சுயவிவரத்தைச் சேமி';

  return (
    <div className="admin-page">
      <div className="admin-page-header mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-1">{T_HEAD}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{T_TITLE}</h1>
        </div>
      </div>

      <div className="flex flex-row gap-8 items-start">
        {/* Profile info card */}
        <div className="w-80 shrink-0 space-y-6">
          <div className="ap-card text-center p-8 bg-white border border-slate-100">
            <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-lg shadow-amber-500/20">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex flex-col mb-6">
              <strong className="text-lg font-black text-slate-950">{user?.name || user?.username}</strong>
              <span className="text-xs font-bold text-slate-400">@{user?.username}</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest">
              <IconShield size={10} className="text-amber-400" />
              {language === 'en' ? 'System Admin' : 'கணினி நிர்வாகி'}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-3">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                <span>{language === 'en' ? 'Access Level' : 'அனுமதி நிலை'}</span>
                <span className="text-slate-900">Root</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                <span>{language === 'en' ? 'Account Status' : 'கணக்கு நிலை'}</span>
                <span className="text-emerald-500 flex items-center gap-1"><IconCheckCircle size={10} /> {language === 'en' ? 'Active' : 'இயக்கத்தில்'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100/50 flex gap-3 shadow-sm">
             <IconLock size={20} className="text-amber-500 shrink-0" />
             <p className="text-[11px] font-bold text-amber-900/60 leading-relaxed text-xs">
               <strong>{language === 'en' ? 'Security Note:' : 'பாதுகாப்பு குறிப்பு:'}</strong> {language === 'en' ? 'Changing your login credentials will take immediate effect on all active sessions.' : 'உங்கள் உள்நுழைவு விவரங்களை மாற்றுவது அனைத்து அமர்வுகளையும் பாதிக்கும்.'}
             </p>
          </div>
        </div>

        {/* Edit form */}
        <div className="flex-1 min-w-0 ap-card p-8 bg-white border border-slate-100">
          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-900">{language === 'en' ? 'Identity & Security' : 'அடையாளம் மற்றும் பாதுகாப்பு'}</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{language === 'en' ? 'Manage your administrative access' : 'நிர்வாக அணுகலை நிர்வகிக்கவும்'}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSave}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{T_NAME}</label>
              <input
                className="text-input h-10 px-4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'en' ? "Full Name" : "முழு பெயர்"}
                required
              />
            </div>

            {/* Language Preferences */}
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">{T_PREF}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{language === 'en' ? 'Global system display language' : 'முழு கணினி காட்சியின் மொழி'}</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>English</button>
                  <button type="button" onClick={() => setLanguage('ta')} className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${language === 'ta' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Tamil</button>
              </div>
            </div>

            {/* Credentials */}
            <div className="pt-6 border-t border-slate-50 space-y-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">{T_CRED}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'New Password' : 'புதிய கடவுச்சொல்'}</label>
                    <input
                        className="text-input h-10 px-4"
                        type="password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Confirm Update' : 'உறுதிப்படுத்தவும்'}</label>
                    <input
                        className="text-input h-10 px-4"
                        type="password"
                        value={pwd2}
                        onChange={(e) => setPwd2(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
              </div>
            </div>

            {error   && <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100">⚠ {error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-100">✔ {success}</div>}

            <div className="flex justify-end pt-4">
                <button 
                  className="px-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all disabled:opacity-50" 
                  type="submit" 
                  disabled={saving}
                >
                    {saving ? '...' : T_SAVE}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
