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
        // Migration/Compatibility handle
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
      
      // Save branding too
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
    <div className="admin-page">
      <div className="admin-page-header mb-12">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">{T_HEAD}</p>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">{T_TITLE}</h1>
        </div>
      </div>

      <div className="flex flex-row gap-12 items-start">
        {/* Profile info card */}
        <div className="w-[400px] shrink-0 space-y-8">
          <div className="ap-card text-center p-12 bg-white border border-slate-100">
            <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white mx-auto mb-6 shadow-xl shadow-amber-500/20">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="flex flex-col mb-8">
              <strong className="text-2xl font-black text-slate-950">{user?.name || user?.username}</strong>
              <span className="text-base font-bold text-slate-400">@{user?.username}</span>
            </div>
            
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
              <IconShield size={14} className="text-amber-400" />
              {language === 'en' ? 'System Admin' : 'கணினி நிர்வாகி'}
            </div>
 
            <div className="mt-12 pt-10 border-t border-slate-50 space-y-4">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <span>{language === 'en' ? 'Access Level' : 'அனுமதி நிலை'}</span>
                <span className="text-slate-900">Root</span>
              </div>
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <span>{language === 'en' ? 'Account Status' : 'கணக்கு நிலை'}</span>
                <span className="text-emerald-500 flex items-center gap-2"><IconCheckCircle size={14} /> {language === 'en' ? 'Active' : 'இயக்கத்தில்'}</span>
              </div>
            </div>
          </div>
 
          <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100/50 flex gap-4 shadow-sm">
             <IconLock size={24} className="text-amber-500 shrink-0" />
             <p className="text-xs font-bold text-amber-900/60 leading-relaxed">
               <strong className="text-amber-700">{language === 'en' ? 'Security Note:' : 'பாதுகாப்பு குறிப்பு:'}</strong><br/>
               {language === 'en' ? 'Changing your login credentials will take immediate effect on all active sessions.' : 'உங்கள் உள்நுழைவு விவரங்களை மாற்றுவது அனைத்து அமர்வுகளையும் பாதிக்கும்.'}
             </p>
          </div>
        </div>

        {/* Edit form */}
        <div className="flex-1 min-w-0 ap-card p-8 bg-white border border-slate-100">
          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-900">{language === 'en' ? 'Identity & Security' : 'அடையாளம் மற்றும் பாதுகாப்பு'}</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{language === 'en' ? 'Manage your administrative access' : 'நிர்வாக அணுகலை நிர்வகிக்கவும்'}</p>
          </div>

          <form className="space-y-8" onSubmit={handleSave}>
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{T_NAME}</label>
              <input
                className="text-input h-14 px-6 text-base"
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

            {/* Credentials / Security */}
            <div className="pt-10 border-t border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <IconLock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{language === 'en' ? 'Security & Credentials' : 'பாதுகாப்பு மற்றும் கடவுச்சொல்'}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Update your administrative password</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="flex flex-col gap-2.5 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{language === 'en' ? 'Current Password' : 'தற்போதைய கடவுச்சொல்'}</label>
                    <input
                        className="text-input h-14 px-6 bg-white text-base"
                        type="password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="••••••••"
                        required={!!newPwd}
                    />
                    <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 italic">{language === 'en' ? 'Verify your identity to authorize changes' : 'மாற்றங்களைச் செய்ய உங்கள் அடையாளத்தைச் சரிபார்க்கவும்'}</p>
                </div>
                
                <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{language === 'en' ? 'New Password' : 'புதிய கடவுச்சொல்'}</label>
                    <input
                        className="text-input h-14 px-6 bg-white text-base"
                        type="password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{language === 'en' ? 'Confirm New Password' : 'புதிய கடவுச்சொல்லை உறுதிப்படுத்துக'}</label>
                    <input
                        className="text-input h-14 px-6 bg-white text-base"
                        type="password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
              </div>
            </div>

            {/* Global Branding Section */}
            <div className="pt-8 border-t border-slate-100 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">{language === 'en' ? 'Global PDF Branding' : 'உலகளாவிய PDF பிராண்டிங்'}</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{language === 'en' ? 'Configure default header/footer for generated reports' : 'அறிக்கைகளுக்கான இயல்புநிலை தலைப்பு/அடிக்குறிப்பை உள்ளமைக்கவும்'}</p>
              </div>

              <div className="flex flex-col gap-1.5 focus-within:ring-2 ring-amber-500/20 rounded-xl transition-all">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Report Logo' : 'அறிக்கை லோகோ'}</label>
                <div className="flex gap-4 items-center">
                  <div className="relative group/logo">
                    <img src={branding.logoUrl} alt="Logo Preview" className="w-16 h-16 object-contain bg-slate-50 rounded-xl border-2 border-slate-100 group-hover/logo:border-amber-300 transition-all" onError={(e) => { e.target.src = '/logo.png' }} />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover/logo:opacity-100 rounded-xl cursor-pointer transition-all">
                      <span className="text-[8px] font-black uppercase tracking-widest">{language === 'en' ? 'Upload' : 'பதிவேற்று'}</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            setSaving(true);
                            const { logoUrl } = await uploadBrandingLogo(file);
                            setBranding({ ...branding, logoUrl });
                          } catch (err) {
                            alert(err.message);
                          } finally {
                            setSaving(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input className="text-input w-full text-[11px]" value={branding.logoUrl} onChange={e => setBranding({...branding, logoUrl: e.target.value})} placeholder="/logo.png or https://..." />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {language === 'en' ? 'Click on preview to upload from local machine' : 'லோகோவை மாற்ற அதன் மீது கிளிக் செய்யவும்'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Astrologer Name (English)</label>
                  <input className="text-input" value={branding.astrologerNameEn} onChange={e => setBranding({...branding, astrologerNameEn: e.target.value})} placeholder="e.g. Sri Vinayaga Astro" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ஜோதிடர் பெயர் (Tamil)</label>
                  <input className="text-input" value={branding.astrologerNameTa} onChange={e => setBranding({...branding, astrologerNameTa: e.target.value})} placeholder="எ.கா. ஸ்ரீ விநாயகா ஆஸ்ட்ரோ" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name (English)</label>
                  <input className="text-input" value={branding.companyNameEn} onChange={e => setBranding({...branding, companyNameEn: e.target.value})} placeholder="e.g. Astro Services" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">நிறுவனத்தின் பெயர் (Tamil)</label>
                  <input className="text-input" value={branding.companyNameTa} onChange={e => setBranding({...branding, companyNameTa: e.target.value})} placeholder="எ.கா. ஆஸ்ட்ரோ சர்வீசஸ்" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Mobile Number' : 'தொலைபேசி எண்'}</label>
                  <input className="text-input" value={branding.mobile} onChange={e => setBranding({...branding, mobile: e.target.value})} placeholder="+91 ..." />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'WhatsApp Number' : 'வாட்ஸ்அப் எண்'}</label>
                  <input className="text-input" value={branding.whatsapp} onChange={e => setBranding({...branding, whatsapp: e.target.value})} placeholder="+91 ..." />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Website' : 'இணையதளம்'}</label>
                <input className="text-input" value={branding.website} onChange={e => setBranding({...branding, website: e.target.value})} placeholder="www.example.com" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Office Address (English)</label>
                  <textarea className="text-input min-h-[80px] py-3" value={branding.addressEn} onChange={e => setBranding({...branding, addressEn: e.target.value})} placeholder="Full address in English..." />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">அலுவலக முகவரி (Tamil)</label>
                  <textarea className="text-input min-h-[80px] py-3" value={branding.addressTa} onChange={e => setBranding({...branding, addressTa: e.target.value})} placeholder="முழு முகவரி தமிழில்..." />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Social Media Links' : 'சமூக ஊடக இணைப்புகள்'}</label>
                  <button type="button" onClick={addSocial} className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase hover:text-amber-700">
                    <IconPlus size={12} /> {language === 'en' ? 'Add Link' : 'இணைப்பைச் சேர்'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {branding.socialMedia.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                      <input className="text-input h-9 text-xs w-32" value={s.platform} onChange={e => handleSocialChange(idx, 'platform', e.target.value)} placeholder="Platform" />
                      <input className="text-input h-9 text-xs flex-1" value={s.url} onChange={e => handleSocialChange(idx, 'url', e.target.value)} placeholder="URL" />
                      <button type="button" onClick={() => removeSocial(idx)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <IconTrash size={16} />
                      </button>
                    </div>
                  ))}
                  {branding.socialMedia.length === 0 && <p className="text-[11px] text-slate-400 italic">No social media links added.</p>}
                </div>
              </div>
            </div>

            {error   && <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100 animate-in shake duration-500">⚠ {error}</div>}
            {success && <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-100 animate-in fade-in duration-500">✔ {success}</div>}

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
