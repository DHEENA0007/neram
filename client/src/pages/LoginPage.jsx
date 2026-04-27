import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { loadPublicContact } from '../api.js';
import { IconUser, IconLock, IconChevronRight, IconActivity, IconPhone, IconWhatsApp } from '../components/Icons.jsx';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isContactView, setIsContactView] = useState(false);
  const language = 'ta'; // Default to Tamil for this portal
  const navigate = useNavigate();
  const { login } = useAuth();

  const [contactInfo, setContactInfo] = useState({
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    appName: 'Sri Vinayaga Astro',
    tagline: 'Ancient Wisdom · Modern Precision'
  });

  useEffect(() => {
    loadPublicContact().then(data => {
      setContactInfo(prev => ({ ...prev, ...data }));
    }).catch(console.error);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  if (isContactView) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa] relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <section className="relative w-full max-w-[480px]">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="mb-6">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto object-contain drop-shadow-xl" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">{contactInfo.appName}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{contactInfo.tagline}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {language === 'en' ? 'Get Started' : 'புதிய பதிவு'}
            </h2>
            <p className="text-slate-500 font-medium mb-10">
              {language === 'en' ? 'Contact our system administrator to create your account and optimize your destiny.' : 'உங்கள் கணக்கை உருவாக்க மற்றும் உங்கள் விதியை மேம்படுத்த கணினி நிர்வாகியை அணுகவும்.'}
            </p>

            <div className="space-y-4">
              <a 
                href={`https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent("I'm interested to buy Sri Vinayaga Astro software. Please help me with the registration.")}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 rounded-3xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <IconWhatsApp size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">WhatsApp</p>
                    <p className="text-sm font-black text-slate-900">Send Message</p>
                  </div>
                </div>
                <IconChevronRight size={20} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </a>

              <a 
                href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-between p-6 rounded-3xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <IconPhone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Phone Call</p>
                    <p className="text-sm font-black text-slate-900">{contactInfo.phone}</p>
                  </div>
                </div>
                <IconChevronRight size={20} className="text-indigo-300 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <button 
              onClick={() => setIsContactView(false)}
              className="w-full mt-10 py-5 rounded-3xl border-2 border-slate-100 text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              {language === 'en' ? 'Back to Login' : 'மீண்டும் உள்நுழைக'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative w-full max-w-[480px]">
        {/* Logo area */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mb-6">
            <img src="/logo.png" alt="Sri Vinayaga Astro Logo" className="w-24 h-24 mx-auto object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Sri Vinayaga Astro</h1>
          <p className="text-lg font-bold text-slate-400 uppercase tracking-[0.2em]">{language === 'en' ? 'Pancha Pakshi Portal' : 'பஞ்சபட்சி போர்டல்'}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Access your personal astrological control center.</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                <IconUser size={14} />
                {language === 'en' ? 'Username' : 'பயனர் பெயர்'}
              </label>
              <div className="relative group">
                <input
                  className="input-field pl-5 group-focus-within:bg-white transition-all"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                <IconLock size={14} />
                {language === 'en' ? 'Password' : 'கடவுச்சொல்'}
              </label>
              <div className="relative group">
                <input
                  className="input-field pl-5 group-focus-within:bg-white transition-all"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wide flex items-center gap-3 animate-in shake duration-500">
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">!</div>
                {error}
              </div>
            )}

            <button 
              className="btn-primary w-full py-5 text-lg group active:scale-95 transition-all shadow-amber-500/30" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                 <div className="w-6 h-6 border-3 border-amber-950/20 border-t-amber-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>{language === 'en' ? 'Sign In to Portal' : 'உள்நுழைக'}</span>
                  <IconChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
             <p className="text-sm font-bold text-slate-400">
               {language === 'en' ? "Don't have an account?" : "கணக்கு இல்லையா?"} 
               <span 
                onClick={() => setIsContactView(true)}
                className="text-amber-600 hover:text-amber-700 cursor-pointer transition-colors ml-1 font-black"
               >
                 {language === 'en' ? 'Register Now' : 'இப்போதே பதிவு செய்யுங்கள்'}
               </span>
             </p>
          </div>
        </div>

        <div className="mt-12 text-center text-xs font-black text-slate-300 uppercase tracking-[0.3em]">
           © 2026 Sri Vinayaga Astro · Secure Access
        </div>
      </section>
    </div>
  );
}

