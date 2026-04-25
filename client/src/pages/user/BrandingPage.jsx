import { useState, useEffect } from 'react';
import { useAuth } from '../../auth.jsx';
import { PortalShell } from '../../components/PortalShell.jsx';
import { requestBrandingAccess, updateCustomBranding } from '../../api.js';
import { IconLock, IconCheckCircle, IconZap, IconPlus, IconTrash, IconClock } from '../../components/Icons.jsx';

export function BrandingPage() {
  const { user, refresh, language } = useAuth();
  const [lang, setLang] = useState(language || 'ta');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    astrologerName: '',
    companyName: '',
    mobile: '',
    whatsapp: '',
    website: '',
    socialMedia: [],
    address: '',
  });

  useEffect(() => {
    if (user?.branding) {
      setForm({
        astrologerName: user.branding.astrologerName || '',
        companyName: user.branding.companyName || '',
        mobile: user.branding.mobile || '',
        whatsapp: user.branding.whatsapp || '',
        website: user.branding.website || '',
        socialMedia: user.branding.socialMedia || [],
        address: user.branding.address || '',
      });
    }
  }, [user]);

  const handleRequestAccess = async () => {
    setLoading(true);
    setError('');
    try {
      await requestBrandingAccess();
      await refresh();
      setSuccess(lang === 'ta' ? 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது. நிர்வாகியின் அனுமதிக்கு காத்திருக்கவும்.' : 'Request submitted. Please wait for admin approval.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateCustomBranding(form);
      await refresh();
      setSuccess(lang === 'ta' ? 'சேமிக்கப்பட்டது!' : 'Saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSocialChange = (index, field, value) => {
    const next = [...form.socialMedia];
    next[index][field] = value;
    setForm({ ...form, socialMedia: next });
  };

  const addSocial = () => {
    setForm({ ...form, socialMedia: [...form.socialMedia, { platform: '', url: '' }] });
  };

  const removeSocial = (index) => {
    setForm({ ...form, socialMedia: form.socialMedia.filter((_, i) => i !== index) });
  };

  const isEnabled = user?.branding?.customEnabled && user?.branding?.requestStatus === 'approved';
  const isPending = user?.branding?.requestStatus === 'pending';

  return (
    <PortalShell title={lang === 'ta' ? 'பிராண்டிங்' : 'PDF Branding'} lang={lang} onToggleLang={() => setLang(l => l === 'ta' ? 'en' : 'ta')}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Status Card */}
        <div className={`p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center gap-8 ${isEnabled ? 'bg-emerald-50 border-emerald-100' : isPending ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${isEnabled ? 'bg-emerald-500 text-white' : isPending ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
            {isEnabled ? <IconCheckCircle size={32} /> : isPending ? <IconClock size={32} /> : <IconLock size={32} />}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {isEnabled ? (lang === 'ta' ? 'தனிப்பயன் பிராண்டிங் இயக்கப்பட்டது' : 'Custom Branding Enabled') : 
               isPending ? (lang === 'ta' ? 'அனுமதிக்காக காத்திருக்கிறது' : 'Waiting for Approval') :
               (lang === 'ta' ? 'தனிப்பயன் பிராண்டிங் முடக்கப்பட்டுள்ளது' : 'Custom Branding Locked')}
            </h2>
            <p className="text-sm font-bold text-slate-500 leading-relaxed">
              {isEnabled ? (lang === 'ta' ? 'உங்கள் சொந்த விவரங்களை PDF அறிக்கைகளில் சேர்த்துக் கொள்ளலாம்.' : 'You can now customize the header and footer of your PDF reports.') :
               isPending ? (lang === 'ta' ? 'உங்கள் விண்ணப்பம் பரிசீலனையில் உள்ளது. நிர்வாகி அனுமதித்தவுடன் நீங்கள் மாற்றங்களைச் செய்யலாம்.' : 'Your request is being reviewed. You can edit your details once the admin approves it.') :
               (lang === 'ta' ? 'இந்த சேவையை பெற நீங்கள் நிர்வாகியிடம் அனுமதி கோர வேண்டும். இது உங்கள் சந்தா காலத்தைப் பொறுத்தது.' : 'To use this feature, you need to request access from the admin. This is available during your active subscription period.')}
            </p>
          </div>
          {!isEnabled && !isPending && (
            <button onClick={handleRequestAccess} disabled={loading} className="px-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all disabled:opacity-50 min-w-[200px]">
              {loading ? '...' : (lang === 'ta' ? 'அனுமதி கோரு' : 'Request Access')}
            </button>
          )}
        </div>

        {/* Edit Form */}
        <div className={`ap-card p-10 bg-white border border-slate-100 space-y-10 transition-all ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{lang === 'ta' ? 'தலைப்பு மற்றும் அடிக்குறிப்பு' : 'Header & Footer Branding'}</h3>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{lang === 'ta' ? 'அறிக்கைகளில் தோன்றும் விவரங்கள்' : 'Details that appear on your PDF reports'}</p>
            </div>
            {isEnabled && <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><IconZap size={12} /> Live</span>}
          </div>

          <form className="space-y-8" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'ta' ? 'ஜோதிடர் பெயர்' : 'Astrologer Name'}</label>
                <input className="text-input h-12" value={form.astrologerName} onChange={e => setForm({...form, astrologerName: e.target.value})} placeholder="e.g. Sri Vinayaga Astro" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'ta' ? 'நிறுவனத்தின் பெயர்' : 'Company Name'}</label>
                <input className="text-input h-12" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} placeholder="e.g. Astro Services" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'ta' ? 'தொலைபேசி எண்' : 'Mobile Number'}</label>
                <input className="text-input h-12" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} placeholder="+91 ..." />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'ta' ? 'வாட்ஸ்அப் எண்' : 'WhatsApp Number'}</label>
                <input className="text-input h-12" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="+91 ..." />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'ta' ? 'இணையதளம்' : 'Website URL'}</label>
              <input className="text-input h-12" value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="www.yourname.com" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'ta' ? 'அலுவலக முகவரி' : 'Physical Address'}</label>
              <textarea className="text-input min-h-[100px] py-4" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Your full office address..." />
            </div>

            {/* Social Media */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{lang === 'ta' ? 'சமூக ஊடகங்கள்' : 'Social Media Links'}</label>
                <button type="button" onClick={addSocial} className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase hover:text-amber-700">
                  <IconPlus size={14} /> {lang === 'ta' ? 'இணைப்புச் சேர்' : 'Add Plateform'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {form.socialMedia.map((s, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input className="text-input h-10 text-xs w-32" value={s.platform} onChange={e => handleSocialChange(idx, 'platform', e.target.value)} placeholder="e.g. YouTube" />
                    <input className="text-input h-10 text-xs flex-1" value={s.url} onChange={e => handleSocialChange(idx, 'url', e.target.value)} placeholder="URL..." />
                    <button type="button" onClick={() => removeSocial(idx)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <IconTrash size={18} />
                    </button>
                  </div>
                ))}
                {form.socialMedia.length === 0 && <p className="text-[11px] text-slate-400 italic">No social profiles added yet.</p>}
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button disabled={saving} className="px-10 py-5 bg-amber-500 text-white text-sm font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50">
                {saving ? '...' : (lang === 'ta' ? 'மாற்றங்களைச் சேமி' : 'Save Branding')}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="p-5 bg-rose-50 text-rose-500 rounded-3xl border border-rose-100 text-sm font-bold animate-in shake duration-500">⚠ {error}</div>}
        {success && <div className="p-5 bg-emerald-50 text-emerald-500 rounded-3xl border border-emerald-100 text-sm font-bold animate-in zoom-in duration-500">✔ {success}</div>}

      </div>
    </PortalShell>
  );
}
