import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bird, Zap, Globe, ArrowRight, Shield, Clock, Users, Sparkles, Send } from 'lucide-react';
import { FaYoutube as Youtube, FaInstagram as Instagram } from 'react-icons/fa';

const L = {
  en: {
    heroTitle: 'Master Your Time with',
    heroAccent: 'Pancha Pakshi',
    heroSub: 'Ancient wisdom meets modern technology. Align your daily activities with the cosmic rhythms of the five elements to maximize success.',
    tryBtn: 'Try it for free',
    howBtn: 'How it works',
    feature1Title: 'Name Bird',
    feature1Sub: 'Discover your ruling bird based on the phonetics of your name. Advanced algorithm for Tamil and English.',
    feature2Title: 'Sookshima Split',
    feature2Sub: 'Divide your hours into high-precision sub-intervals. Know exactly when to act or rest.',
    feature3Title: 'Global Precision',
    feature3Sub: 'Location-aware calculations including sunrise/sunset times anywhere in the world.',
    readyTitle: 'Ready to optimize your day?',
    readySub: 'Join thousands of users who plan their meetings, journeys, and rest using the ancient science of Pancha Pakshi.',
    startBtn: 'Get Started Now',
    signin: 'Sign In',
    langBtn: 'தமிழ்'
  },
  ta: {
    heroTitle: 'உங்கள் நேரத்தை வசப்படுத்துங்கள் -',
    heroAccent: 'பஞ்சபட்சி',
    heroSub: 'பண்டைய ஞானம் மற்றும் நவீன தொழில்நுட்பம். உங்கள் தினசரிச் செயல்பாடுகளை பஞ்சபூதங்களின் பிரபஞ்ச தாளத்துடன் இணைத்து வெற்றியை அடையுங்கள்.',
    tryBtn: 'இலவசமாக முயற்சிக்கவும்',
    howBtn: 'இது எப்படி வேலை செய்கிறது?',
    feature1Title: 'பெயர் பட்சி',
    feature1Sub: 'உங்கள் பெயரின் ஒலியியலை அடிப்படையாகக் கொண்டு உங்கள் ஆளும் பட்சியைக் கண்டறியவும். தமிழ் மற்றும் ஆங்கிலத்திற்கு ஆதரவு உண்டு.',
    feature2Title: 'சூட்சுமப் பிரிவு',
    feature2Sub: 'உங்கள் நேரத்தை அதிக துல்லியமான இடைவெளிகளாகப் பிரிக்கவும். எப்போது செயல்பட வேண்டும் அல்லது ஓய்வெடுக்க வேண்டும் என்பதைச் சரியாகத் தெரிந்து கொள்ளுங்கள்.',
    feature3Title: 'உலகளாவிய துல்லியம்',
    feature3Sub: 'உலகின் எந்த இடத்திலும் சூரிய உதயம்/அஸ்தமன நேரங்கள் உட்பட இருப்பிட விழிப்புணர்வு கணக்கீடுகள்.',
    readyTitle: 'உங்கள் நாளை மேம்படுத்தத் தயாரா?',
    readySub: 'ஆயிரக்கணக்கான பயனர்களுடன் இணைந்து பஞ்சபட்சி சாஸ்திரத்தைப் பயன்படுத்தி உங்கள் சந்திப்புகள், பயணங்கள் மற்றும் ஓய்வைத் திட்டமிடுங்கள்.',
    startBtn: 'இப்போதே தொடங்குங்கள்',
    signin: 'உள்நுழைக',
    langBtn: 'English'
  }
};

export function LandingPage() {
  const [lang, setLang] = useState('ta');
  const t = L[lang];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="text-xl font-black font-serif text-yellow-500 tracking-tight">Sri Vinayaga Astro</div>
        <div className="flex items-center gap-4">
          <button 
            className="text-xs font-bold text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-all"
            onClick={() => setLang(l => l === 'ta' ? 'en' : 'ta')}
          >
            {t.langBtn}
          </button>
          <Link to="/login" className="btn-primary py-1.5 px-5 shadow-none text-xs">
            {t.signin}
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section with Image Background */}
        <section className="relative pt-48 pb-20 px-6 text-center overflow-hidden min-h-[80vh] flex flex-col justify-center bg-slate-950">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/hero-bg.png" 
              alt="Cosmic Background" 
              className="w-full h-full object-cover scale-105 animate-slow-zoom brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {t.heroTitle} <br />
              <span className="text-yellow-400">{t.heroAccent}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10 max-w-xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {t.heroSub}
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              <Link to="/login" className="btn-primary text-lg px-8 py-4 shadow-xl shadow-yellow-500/30">
                {t.tryBtn}
              </Link>
              <a href="#features" className="btn-ghost text-lg px-8 py-4 bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all">
                {t.howBtn}
              </a>
            </div>
          </div>
        </section>

        {/* Features Content */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Built for Modern Precision</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Combining ancient Vedic wisdom with high-performance algorithms for modern spiritual productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300 bg-white border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-105 transition-all">
                <Bird size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{t.feature1Title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {t.feature1Sub}
              </p>
            </div>

            <div className="glass-card p-8 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300 bg-white border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-105 transition-all">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{t.feature2Title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {t.feature2Sub}
              </p>
            </div>

            <div className="glass-card p-8 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300 bg-white border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-all">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{t.feature3Title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {t.feature3Sub}
              </p>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="bg-slate-50 py-24 border-y border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-amber-600 font-bold uppercase tracking-wider text-xs mb-3 block">Engineered for Success</span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
                  Seamlessly plan your journey with <span className="text-amber-500">Ancient Intelligence</span>
                </h2>
                <div className="space-y-5">
                  {[
                    { icon: Shield, title: "Unmatched Accuracy", sub: "Calculations based on 2000-year-old scriptures validated for today." },
                    { icon: Clock, title: "Precision Scheduling", sub: "Down to the minute granularity for your most important decisions." },
                    { icon: Users, title: "Trusted Community", sub: "Join over 50,000 users who trust Sri Vinayaga Astro for their daily planning." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center text-amber-500">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-0.5">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-all duration-500">
                  <img 
                    src="/assets/dashboard.png" 
                    alt="Pancha Pakshi Interface" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-24 text-center px-6 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
             <img src="/assets/hero-bg.png" alt="" className="w-full h-full object-cover" />
           </div>
           
           <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{t.readyTitle}</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                {t.readySub}
              </p>
              <Link to="/login" className="bg-amber-500 text-amber-950 px-10 py-4 rounded-xl font-black text-xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 group">
                {t.startBtn}
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center justify-center">
          <div className="text-center md:text-left">
            <div className="text-2xl font-black font-serif text-yellow-600 mb-2">Sri Vinayaga Astro</div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              © 2026 Sri Vinayaga Astro.
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <a href="https://www.youtube.com/channel/UC9SCqt01k0jr511hVijxZEA" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center hover:scale-110 hover:bg-rose-100 transition-all shadow-sm">
              <Youtube size={24} />
            </a>
            <a href="https://www.instagram.com/svastro.in?igsh=MWc4OWtzbnc0eWQ3bg==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center hover:scale-110 hover:bg-pink-100 transition-all shadow-sm">
              <Instagram size={24} />
            </a>
            <a href="https://t.me/marrigematching" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:scale-110 hover:bg-blue-100 transition-all shadow-sm">
              <Send size={24} />
            </a>
          </div>

          <div className="text-center md:text-right">
            <a href="https://svastro.in" className="text-lg font-black text-slate-900 hover:text-yellow-600 transition-colors">
              svastro.in
            </a>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">
              Ancient Wisdom · Modern Interface
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
