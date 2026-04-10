import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-black font-serif text-yellow-600 tracking-tight">Neram</div>
        <div className="flex items-center gap-4">
          <button 
            className="text-sm font-bold text-slate-600 hover:text-yellow-600 px-4 py-2 rounded-full hover:bg-white/50 transition-all"
            onClick={() => setLang(l => l === 'ta' ? 'en' : 'ta')}
          >
            {t.langBtn}
          </button>
          <Link to="/login" className="btn-primary py-2 px-6 shadow-none">
            {t.signin}
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section with Image Background */}
        <section className="relative pt-48 pb-32 px-6 text-center overflow-hidden min-h-[85vh] flex flex-col justify-center">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/hero-bg.png" 
              alt="Cosmic Background" 
              className="w-full h-full object-cover scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {t.heroTitle} <br />
              <span className="text-yellow-500">{t.heroAccent}</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-12 max-w-2xl mx-auto font-medium opacity-90 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {t.heroSub}
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              <Link to="/login" className="btn-primary text-xl px-12 py-5 shadow-2xl shadow-yellow-500/40">
                {t.tryBtn}
              </Link>
              <a href="#features" className="btn-ghost text-xl px-10 py-5 bg-white/80">
                {t.howBtn}
              </a>
            </div>
          </div>
        </section>

        {/* Features Content */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 py-32">
          <div className="glass-card p-12 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 bg-white/30 border-white/50">
            <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">🐦</div>
            <h3 className="text-2xl font-bold mb-4">{t.feature1Title}</h3>
            <p className="text-slate-500 leading-relaxed text-lg italic">
              {t.feature1Sub}
            </p>
          </div>

          <div className="glass-card p-12 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 bg-white/30 border-white/50">
            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">⚡</div>
            <h3 className="text-2xl font-bold mb-4">{t.feature2Title}</h3>
            <p className="text-slate-500 leading-relaxed text-lg italic">
              {t.feature2Sub}
            </p>
          </div>

          <div className="glass-card p-12 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 bg-white/30 border-white/50">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">🌍</div>
            <h3 className="text-2xl font-bold mb-4">{t.feature3Title}</h3>
            <p className="text-slate-500 leading-relaxed text-lg italic">
              {t.feature3Sub}
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-yellow-400/90 py-32 text-center px-6 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none grayscale brightness-200">
             <img src="/assets/hero-bg.png" alt="" className="w-full h-full object-cover" />
           </div>
           
           <div className="relative z-10">
              <h2 className="text-5xl font-black text-yellow-950 mb-8">{t.readyTitle}</h2>
              <p className="text-yellow-900 text-xl mb-12 max-w-2xl mx-auto font-bold opacity-70">
                {t.readySub}
              </p>
              <Link to="/login" className="bg-white text-yellow-600 px-12 py-5 rounded-3xl font-black text-2xl shadow-2xl shadow-yellow-950/20 hover:scale-105 active:scale-95 transition-all inline-block">
                {t.startBtn}
              </Link>
           </div>
        </section>
      </main>

      <footer className="py-16 px-6 border-t border-slate-100 text-center bg-white">
        <div className="text-3xl font-black font-serif text-yellow-600 mb-6">Neram</div>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
          © 2026 Neram Pancha Pakshi. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
