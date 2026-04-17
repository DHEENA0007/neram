import React, { useState, useMemo, useEffect } from 'react';
import { birdOptions, getBirdById, pakshaOptions } from '../../shared/constants.js';
import { requestPrediction } from '../../api.js';
import { PortalShell } from '../../components/PortalShell.jsx';
import { ScheduleTable } from '../../components/ScheduleTable.jsx';
import { NameBirdSection } from '../../components/NameBirdSection.jsx';
import { HoraiTable } from '../../components/HoraiTable.jsx';
import { SpecialPeriods } from '../../components/SpecialPeriods.jsx';
import { GowriTable } from '../../components/GowriTable.jsx';
import { BirdHelper } from '../../components/BirdHelper.jsx';
import { IconArrowRight, IconVulture, IconOwl, IconCrow, IconHen, IconPeacock, IconCheck, IconCalendar, IconLocation, IconSun, IconSearch, IconDownload } from '../../components/Icons.jsx';
import { PrintView } from '../../components/PrintView.jsx';

const BIRD_ICONS = {
  vulture: IconVulture,
  owl: IconOwl,
  crow: IconCrow,
  cock: IconHen,
  peacock: IconPeacock
};

const L = {
  en: {
    title: 'Pancha Pakshi Schedule',
    date_label: 'Select Date',
    location_label: 'Your Location',
    bird_label: 'Your Bird',
    paksha_type: 'Paksha Type',
    generate: 'Generate Schedule',
    generating: 'Calculating...',
    auto: 'Automatic',
    use_current: 'Use my current location',
    selected: 'Selected Location:',
    weekday: 'Weekday',
    sunrise: 'Sunrise',
    paksha: 'Paksha',
  },
  ta: {
    title: 'பஞ்சபட்சி அட்டவணை',
    date_label: 'தேதியைத் தேர்ந்தெடுக்கவும்',
    location_label: 'உங்கள் இடம்',
    bird_label: 'உங்கள் பட்சி',
    paksha_type: 'பிறை வகை',
    generate: 'அட்டவணை காண்க',
    generating: 'கணக்கிடப்படுகிறது...',
    auto: 'தானியங்கி',
    use_current: 'எனது இருப்பிடத்தைப் பயன்படுத்து',
    selected: 'தேர்ந்தெடுக்கப்பட்ட இடம்:',
    weekday: 'கிழமை',
    sunrise: 'சூரிய உதயம்',
    paksha: 'பிறை',
  }
};

export function UserPortal() {
  const [lang, setLang] = useState('ta');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [birdId, setBirdId] = useState('1');
  const [paksha, setPaksha] = useState('bright');
  const [autoPaksha, setAutoPaksha] = useState(true);
  const [locationName, setLocationName] = useState('Karur, Tamil Nadu, India');
  const [lat, setLat] = useState(10.9577);
  const [lng, setLng] = useState(78.0810);
  const [useGeo, setUseGeo] = useState(false);
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = L[lang];

  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (useGeo && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationName(`Current Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      });
    }
  }, [useGeo]);

  useEffect(() => {
     if (locationName.length < 3) {
        setResults([]);
        return;
     }
     const timer = setTimeout(async () => {
        try {
           const { searchPlaces } = await import('../../api.js');
           const data = await searchPlaces(locationName);
           setResults(data.results || []);
           setShowResults(true);
        } catch (e) {
           console.error('Place search failed', e);
        }
     }, 200);
     return () => clearTimeout(timer);
  }, [locationName]);

  const summary = useMemo(() => {
    if (!prediction || !prediction.astronomy) return null;
    const now = new Date().toISOString();
    const isNight = now >= prediction.astronomy.sunset && now < prediction.astronomy.nextSunrise;
    const currentPaksha = isNight ? prediction.paksha?.night : prediction.paksha?.day;

    return {
      date: prediction.date,
      weekday: prediction.weekday,
      paksha: currentPaksha,
      dayPaksha: prediction.paksha?.day,
      nightPaksha: prediction.paksha?.night,
      sunrise: prediction.astronomy.sunrise,
      currentHorai: prediction.horai?.find(h => now >= h.start && now < h.end),
      currentGowri: prediction.gowri?.find(g => now >= g.start && now < g.end)
    };
  }, [prediction]);

  async function handleSubmit(event) {
    if (event) event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { requestPrediction } = await import('../../api.js');
      const data = await requestPrediction({
        date,
        birdId: Number(birdId),
        place: { 
          latitude: lat, 
          longitude: lng, 
          name: locationName,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        pakshaMode: autoPaksha ? 'auto' : paksha,
      });
      setPrediction(data.schedule ?? data);
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  }

  function formatTimeFromISO(iso) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function formatDateDisplay(d) {
    return new Date(d).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <PortalShell title={t.title} lang={lang} onToggleLang={() => setLang(lang === 'ta' ? 'en' : 'ta')}>
      <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start">

        {/* CONFIG SIDEBAR */}
        <aside className="no-print w-full xl:w-[420px] shrink-0 space-y-4 sm:space-y-6 xl:sticky xl:top-[88px] max-h-none xl:max-h-[calc(100vh-120px)] overflow-y-auto pr-0 xl:pr-2 pb-10 sm:pb-20 scrollbar-hide">
          <NameBirdSection 
            lang={lang} 
            onUpdateBird={(id) => setBirdId(String(id))} 
          />

          <BirdHelper 
            lang={lang} 
            onSelectBird={(id) => {
              setBirdId(String(id));
              document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />

          <section className="glass-card shadow-card-sm p-8 border-none ring-1 ring-slate-100/80 bg-white/80">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                {lang === 'ta' ? 'அமைப்பு' : 'Configuration'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.date_label}</label>
                  <div className="relative group">
                    <input
                      type="date"
                      className="input-field bg-slate-50/50 border-slate-200 group-hover:bg-white group-hover:border-amber-400 group-hover:ring-8 group-hover:ring-amber-500/5 transition-all text-sm font-bold pl-4 pr-16"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setDate(new Date().toISOString().split('T')[0])}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-amber-100/50 hover:bg-amber-400 hover:text-white rounded-md text-[9px] font-black uppercase tracking-tighter text-amber-700 active:scale-95 transition-all"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.location_label}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      className="input-field bg-slate-50/50 border-slate-200 group-hover:bg-white group-hover:border-amber-400 group-hover:ring-8 group-hover:ring-amber-500/5 transition-all text-xs font-bold"
                      value={locationName}
                      onChange={(e) => {
                        setLocationName(e.target.value);
                        setUseGeo(false);
                      }}
                      onFocus={() => results.length > 0 && setShowResults(true)}
                      placeholder="City name..."
                    />
                    
                    {showResults && results.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 border-none z-[100] overflow-hidden max-h-[240px] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                        {results.map((r, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setLocationName(r.label);
                              setLat(r.latitude);
                              setLng(r.longitude);
                              setResults([]);
                              setShowResults(false);
                            }}
                            className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none group/item"
                          >
                             <div className="text-[10px] font-black text-slate-800 line-clamp-2 group-hover/item:text-amber-600 transition-colors uppercase tracking-tight">
                               {r.label}
                             </div>
                             <div className="text-[8px] font-bold text-slate-400 mt-1 tabular-nums">
                               {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
                             </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start capitalize">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t.selected}</span>
                           <span className="text-[11px] font-black text-slate-700 line-clamp-1">{locationName}</span>
                        </div>
                        <span className="text-[9px] font-bold text-indigo-400 tabular-nums bg-indigo-50 px-2 py-0.5 rounded-md">
                          {lat.toFixed(3)}, {lng.toFixed(3)}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 pt-1 cursor-pointer select-none group/geo">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${useGeo ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-200 group-hover/geo:border-amber-400'}`}>
                           {useGeo && <IconCheck size={10} className="text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={useGeo}
                          onChange={(e) => setUseGeo(e.target.checked)}
                          className="hidden"
                        />
                        <span className="text-[10px] font-bold text-slate-500 group-hover/geo:text-slate-900 transition-colors">{t.use_current}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.bird_label}</label>
                  <div className="grid grid-cols-5 gap-3">
                    {birdOptions.map((bird) => (
                      <button
                        key={bird.id}
                        type="button"
                        onClick={() => setBirdId(String(bird.id))}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                          String(birdId) === String(bird.id)
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/30 scale-105 z-10'
                            : 'bg-white border-slate-50 text-slate-300 hover:border-amber-200 hover:bg-amber-50/30'
                        }`}
                        title={lang === 'ta' ? bird.tamil : bird.label}
                      >
                        {(() => {
                           const Icon = BIRD_ICONS[bird.key];
                           return <Icon size={24} className={String(birdId) === String(bird.id) ? 'scale-110' : ''} />;
                        })()}
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-80">
                          {lang === 'ta' ? bird.tamil : bird.key}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.paksha_type}</label>
                   <div className="flex gap-1 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
                      <button 
                        type="button"
                        onClick={() => { setPaksha('bright'); setAutoPaksha(false); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paksha === 'bright' && !autoPaksha ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-500/10' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {lang === 'ta' ? 'வளர்பிறை' : 'Bright'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setPaksha('dark'); setAutoPaksha(false); }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paksha === 'dark' && !autoPaksha ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-500/10' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {lang === 'ta' ? 'தேயிறை' : 'Dark'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAutoPaksha(true)}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${autoPaksha ? 'bg-amber-400 text-amber-950 shadow-md ring-1 ring-amber-500/10' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {t.auto}
                      </button>
                   </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-4 group flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-amber-500/30"
              >
                {loading ? (
                   <>
                     <div className="w-4 h-4 border-2 border-amber-950/20 border-t-amber-950 rounded-full animate-spin" />
                     {t.generating}
                   </>
                ) : (
                  <>
                    <span className="text-[11px] uppercase tracking-[0.2em]">{t.generate}</span>
                    <IconArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-8 bg-rose-50 border border-rose-100 text-rose-600 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wide flex items-start gap-3 animate-in shake duration-500">
                <div className="w-6 h-6 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 font-black">!</div>
                <div className="flex-1 leading-normal">{error}</div>
              </div>
            )}
          </section>

        </aside>

        {/* MAIN RESULTS AREA */}
        <div className="flex-1 min-w-0 w-full space-y-10 min-h-[800px]">
          {prediction && summary ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000">

              {/* PRINT VIEW (hidden on screen, visible only when printing) */}
              <PrintView prediction={prediction} lang={lang} locationName={locationName} />

              {/* PRINT BUTTON */}
              <div className="no-print flex justify-end">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-800/20 active:scale-95 transition-all"
                >
                  <IconDownload size={14} />
                  {lang === 'ta' ? 'PDF பதிவிறக்கம்' : 'Download PDF'}
                </button>
              </div>

              {/* SUMMARY DASHBOARD */}
              <div className="no-print space-y-8">
                <SpecialPeriods periods={prediction.specialPeriods} lang={lang} />
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { label: t.date_label, value: formatDateDisplay(summary.date) },
                    { label: t.weekday, value: lang === 'ta' ? summary.weekday.tamil : summary.weekday.label, highlight: 'text-amber-600' },
                    { label: t.sunrise, value: formatTimeFromISO(summary.sunrise), mono: true },
                    { label: t.paksha, value: lang === 'ta' ? summary.paksha?.tamil : summary.paksha?.label, badge: 'emerald' },
                    { label: lang === 'ta' ? 'பகல் திசை' : 'Day Direction', value: lang === 'ta' ? summary.dayPaksha?.direction?.tamil : summary.dayPaksha?.direction?.label, badge: 'indigo' },
                    { label: lang === 'ta' ? 'இரவு திசை' : 'Night Direction', value: lang === 'ta' ? summary.nightPaksha?.direction?.tamil : summary.nightPaksha?.direction?.label, badge: 'indigo' },
                    { 
                      label: lang === 'ta' ? 'இன்றைய ஹோரை' : 'Current Horai', 
                      node: summary.currentHorai ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50 text-amber-700 shadow-sm ring-1 ring-white">
                          <IconSun size={12} className="animate-spin-slow" />
                          <span className="text-[10px] font-black uppercase">
                            {lang === 'ta' ? summary.currentHorai.planet.tamil : summary.currentHorai.planet.label}
                          </span>
                        </div>
                      ) : <span className="text-slate-300">—</span>
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="glass-card shadow-card-sm p-5 border-none ring-1 ring-slate-100/50 flex flex-col justify-center gap-2 hover:scale-[1.02] transition-all">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                       {item.node ? item.node : (
                         <span className={`text-sm font-black ${item.highlight || 'text-slate-800'} ${item.mono ? 'font-mono text-xs' : ''}`}>
                            {item.badge ? (
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-wider ${item.badge === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'}`}>
                                {item.value}
                              </span>
                            ) : item.value}
                         </span>
                       )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SCHEDULE TABLES */}
              <div className="no-print space-y-20">
                <ScheduleTable tone="day" yamas={prediction.dayYamas} lang={lang} />
                <ScheduleTable tone="night" yamas={prediction.nightYamas} lang={lang} />
                
                <HoraiTable horai={prediction.horai} lang={lang} />
                <GowriTable gowri={prediction.gowri} lang={lang} />
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200/60 m-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative flex flex-col items-center animate-in zoom-in slide-in-from-bottom-12 duration-1000">
                <div className="w-24 h-24 rounded-[3rem] bg-amber-500/10 flex items-center justify-center text-amber-500 mb-8 shadow-sm ring-1 ring-amber-500/20 animate-slow-bounce">
                  <IconCalendar size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">{lang === 'ta' ? 'தயார்' : 'Ready'}</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-[320px] text-center leading-loose opacity-70">
                  {lang === 'ta' ? 'தேதி, இடம் மற்றும் பட்சி தேர்வு செய்து அட்டவணையை காண்க.' : 'Select date, location and bird to view your astrological schedule.'}
                </p>
                
                <div className="mt-12 flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
