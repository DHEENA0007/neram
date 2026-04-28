import { updateAdminProfile, loadAdminSettings, updateAdminSettings, uploadBrandingLogo } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { IconShield, IconCheckCircle, IconZap, IconLock, IconSettings, IconExternalLink, IconPlus, IconTrash } from '../../components/Icons.jsx';
import { useEffect, useState } from 'react';

export function SettingsPage() {
  const { user, refresh, language, setLanguage } = useAuth();
  const [name, setName]   = useState(user?.name || '');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Branding State
  const [branding, setBranding] = useState({
    logoUrl: '/logo.png',
    astrologerNameEn: '',
    astrologerNameTa: '',
    companyNameEn: '',
    companyNameTa: '',
    mobile: '',
    whatsapp: '',
    website: '',
    socialMedia: [],
    addressEn: '',
    addressTa: '',
  });

  useEffect(() => {
    loadAdminSettings().then(s => {
      if (s.branding) {
        const b = s.branding;
        setBranding({
          ...branding,
          ...b,
          astrologerNameEn: b.astrologerNameEn || b.astrologerName || '',
          astrologerNameTa: b.astrologerNameTa || '',
          companyNameEn: b.companyNameEn || b.companyName || '',
          companyNameTa: b.companyNameTa || '',
          addressEn: b.addressEn || b.address || '',
          addressTa: b.addressTa || '',
          logoUrl: b.logoUrl || '/logo.png'
        });
      }
    }).catch(console.error);
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (newPwd && newPwd !== confirmPwd) {
      setError(language === 'en' ? 'Passwords do not match.' : 'கடவுச்சொற்கள் பொருந்தவில்லை.');
      return;
    }

    setSaving(true);
    try {
      const payload = { name };
      if (newPwd) {
        payload.currentPassword = currentPwd;
        payload.newPassword = newPwd;
      }
      await updateAdminProfile(payload);
      await updateAdminSettings({ branding });
      await refresh();
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setSuccess(language === 'en' ? 'Settings updated successfully.' : 'அமைப்புகள் புதுப்பிக்கப்பட்டன.');
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  }

  const handleSocialChange = (index, field, value) => {
    const next = [...branding.socialMedia];
    next[index][field] = value;
    setBranding({ ...branding, socialMedia: next });
  };

  const addSocial = () => {
    setBranding({ ...branding, socialMedia: [...branding.socialMedia, { platform: '', url: '' }] });
  };

  const removeSocial = (index) => {
    setBranding({ ...branding, socialMedia: branding.socialMedia.filter((_, i) => i !== index) });
  };

  const T_HEAD  = language === 'en' ? 'சுயவிவரம் · My Account' : 'எனது கணக்கு';
  const T_TITLE = language === 'en' ? 'Settings' : 'அமைப்புகள்';
  const T_NAME  = language === 'en' ? 'Administrator Display Name' : 'நிர்வாகியின் பெயர்';
  const T_PREF  = language === 'en' ? 'Preferences' : 'விருப்பத்தேர்வுகள்';
  const T_CRED  = language === 'en' ? 'Credentials' : 'அடையாளச் சான்றுகள்';
  const T_SAVE  = language === 'en' ? 'Synchronize Profile' : 'சுயவிவரத்தைச் சேமி';

  return (
    <div className="admin-page max-w-6xl mx-auto space-y-4 pb-16">
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">{T_HEAD}</p>
        <h1 className="text-2xl font-bold text-slate-900">{T_TITLE}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Profile info card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-4 shadow-sm">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex flex-col mb-4">
              <strong className="text-base font-bold text-slate-900">{user?.name || user?.username}</strong>
              <span className="text-[10px] font-medium text-slate-400">@{user?.username}</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider">
              <IconShield size={12} className="text-amber-400" />
              {language === 'en' ? 'System Admin' : 'கணினி நிர்வாகி'}
            </div>
  
            <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{language === 'en' ? 'Access Level' : 'அனுமதி நிலை'}</span>
                <span className="text-slate-900">Root</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{language === 'en' ? 'Account Status' : 'கணக்கு நிலை'}</span>
                <span className="text-emerald-500 flex items-center gap-2 font-bold"><IconCheckCircle size={12} /> {language === 'en' ? 'Active' : 'இயக்கத்தில்'}</span>
              </div>
            </div>
          </div>
  
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 flex gap-3 shadow-sm">
             <IconLock size={18} className="text-amber-500 shrink-0 mt-0.5" />
             <p className="text-[10px] font-medium text-amber-900/60 leading-normal">
               <strong className="text-amber-700">{language === 'en' ? 'Security Note:' : 'பாதுகாப்பு குறிப்பு:'}</strong><br/>
               {language === 'en' ? 'Changing credentials takes immediate effect on all sessions.' : 'விவரங்களை மாற்றுவது அனைத்து அமர்வுகளையும் பாதிக்கும்.'}
             </p>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">{language === 'en' ? 'Identity & Security' : 'அடையாளம் மற்றும் பாதுகாப்பு'}</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your administrative access</p>
          </div>

          <form className="space-y-6" onSubmit={handleSave}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{T_NAME}</label>
              <input
                className="text-input h-10 px-4 text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{T_PREF}</p>
                <p className="text-[9px] font-medium text-slate-300 mt-0.5">System display language</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                  <button type="button" onClick={() => setLanguage('en')} className={`px-4 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>English</button>
                  <button type="button" onClick={() => setLanguage('ta')} className={`px-4 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${language === 'ta' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Tamil</button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 bg-slate-50/50 -mx-6 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                  <IconLock size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{language === 'en' ? 'Security & Credentials' : 'பாதுகாப்பு & கடவுச்சொல்'}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Current Password</label>
                    <input className="text-input h-10 px-4 bg-white text-xs" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" required={!!newPwd} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">New Password</label>
                    <input className="text-input h-10 px-4 bg-white text-xs" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Confirm New</label>
                    <input className="text-input h-10 px-4 bg-white text-xs" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{language === 'en' ? 'PDF Branding' : 'PDF பிராண்டிங்'}</h2>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Configure header/footer for reports</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Report Logo</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="relative group/logo">
                    <img src={branding.logoUrl} alt="Logo" className="w-14 h-14 object-contain bg-slate-50 rounded-xl border border-slate-100 group-hover/logo:border-amber-300 transition-all" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover/logo:opacity-100 rounded-xl cursor-pointer transition-all">
                      <span className="text-[8px] font-bold uppercase">Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          setSaving(true);
                          const { logoUrl } = await uploadBrandingLogo(file);
                          setBranding({ ...branding, logoUrl });
                        } catch (err) { alert(err.message); }
                        finally { setSaving(false); }
                      }} />
                    </label>
                  </div>
                  <input className="text-input w-full text-[10px] h-9" value={branding.logoUrl} onChange={e => setBranding({...branding, logoUrl: e.target.value})} placeholder="URL" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className="text-[9px] font-extrabold uppercase text-slate-400">Astrologer (EN)</label><input className="text-input h-9 text-xs" value={branding.astrologerNameEn} onChange={e => setBranding({...branding, astrologerNameEn: e.target.value})} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[9px] font-extrabold uppercase text-slate-400">Astrologer (TA)</label><input className="text-input h-9 text-xs" value={branding.astrologerNameTa} onChange={e => setBranding({...branding, astrologerNameTa: e.target.value})} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[9px] font-extrabold uppercase text-slate-400">Company (EN)</label><input className="text-input h-9 text-xs" value={branding.companyNameEn} onChange={e => setBranding({...branding, companyNameEn: e.target.value})} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[9px] font-extrabold uppercase text-slate-400">Company (TA)</label><input className="text-input h-9 text-xs" value={branding.companyNameTa} onChange={e => setBranding({...branding, companyNameTa: e.target.value})} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[9px] font-extrabold uppercase text-slate-400">Mobile</label><input className="text-input h-9 text-xs" value={branding.mobile} onChange={e => setBranding({...branding, mobile: e.target.value})} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[9px] font-extrabold uppercase text-slate-400">WhatsApp</label><input className="text-input h-9 text-xs" value={branding.whatsapp} onChange={e => setBranding({...branding, whatsapp: e.target.value})} /></div>
              </div>
              
              <div className="flex flex-col gap-1.5 text-right mt-2">
                 <button onClick={addSocial} className="text-[10px] font-bold text-amber-600 uppercase flex items-center justify-end gap-1"><IconPlus size={12}/> Social Link</button>
                 <div className="space-y-2 mt-2">
                    {branding.socialMedia.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input className="text-input h-8 text-[10px] w-24" value={s.platform} onChange={e => handleSocialChange(idx, 'platform', e.target.value)} placeholder="Platform" />
                        <input className="text-input h-8 text-[10px] flex-1" value={s.url} onChange={e => handleSocialChange(idx, 'url', e.target.value)} placeholder="URL" />
                        <button type="button" onClick={() => removeSocial(idx)} className="text-slate-300 hover:text-rose-500"><IconTrash size={14}/></button>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {error   && <div className="p-2.5 bg-rose-50 text-rose-500 rounded-lg text-[10px] font-bold border border-rose-100">⚠ {error}</div>}
            {success && <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-lg text-[10px] font-bold border border-emerald-100">✔ {success}</div>}

            <div className="flex justify-end pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-slate-50 lg:static lg:bg-transparent lg:p-0 lg:border-none">
                <button 
                  className="w-full lg:w-auto px-10 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50" 
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
