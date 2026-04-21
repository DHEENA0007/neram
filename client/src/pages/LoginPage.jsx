import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { IconUser, IconLock, IconChevronRight, IconActivity } from '../components/Icons.jsx';

export function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const language = 'ta'; // Default to Tamil for this portal
  const navigate = useNavigate();
  const { login } = useAuth();

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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafafa] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative w-full max-w-[480px]">
        {/* Logo area */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-[2rem] shadow-2xl shadow-amber-500/40 text-white mb-6 border-4 border-white">
            <IconActivity size={40} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">Neram</h1>
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
               {language === 'en' ? "Don't have an account?" : "கணக்கு இல்லையா?"} <span className="text-amber-600 hover:text-amber-700 cursor-pointer transition-colors ml-1 font-black">{language === 'en' ? 'Contact System Admin' : 'நிர்வாகியை அணுகவும்'}</span>
             </p>
          </div>
        </div>

        <div className="mt-12 text-center text-xs font-black text-slate-300 uppercase tracking-[0.3em]">
           © 2026 Neram Pancha Pakshi · Secure Access
        </div>
      </section>
    </div>
  );
}

