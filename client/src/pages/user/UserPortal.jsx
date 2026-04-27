import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../auth.jsx';
import { birdOptions, getBirdById, pakshaOptions } from '../../shared/constants.js';
import { requestPrediction, requestRangeSchedule } from '../../api.js';
import { PortalShell } from '../../components/PortalShell.jsx';
import { ScheduleTable } from '../../components/ScheduleTable.jsx';
import { NameBirdSection } from '../../components/NameBirdSection.jsx';
import { HoraiTable } from '../../components/HoraiTable.jsx';
import { SpecialPeriods } from '../../components/SpecialPeriods.jsx';
import { GowriTable } from '../../components/GowriTable.jsx';
import { BirdHelper } from '../../components/BirdHelper.jsx';
import { IconArrowRight, IconVulture, IconOwl, IconCrow, IconHen, IconPeacock, IconCheck, IconCalendar, IconLocation, IconSun, IconSearch, IconDownload, IconSunrise, IconSunset } from '../../components/Icons.jsx';
import { PrintView } from '../../components/PrintView.jsx';
import { PrintOptionsModal } from '../../components/PrintOptionsModal.jsx';
import { RangePrintView } from '../../components/RangePrintView.jsx';
import { loadBrandingConfig } from '../../api.js';

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
    sunset: 'Sunset',
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
    sunset: 'சூரிய அஸ்தமனம்',
    paksha: 'பிறை',
  }
};

export function UserPortal() {
  const { user, requestDownloadAccess, recordDownload } = useAuth();
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

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [rangeData, setRangeData] = useState(null);
  const [rangeCategories, setRangeCategories] = useState([]);
  const [rangeDates, setRangeDates] = useState({ from: date, to: date });
  const [printSubTable, setPrintSubTable] = useState(true);
  const [branding, setBranding] = useState(null);

  const t = L[lang];

  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadBrandingConfig().then(setBranding).catch(console.error);
  }, []);

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
    const nowMs = Date.now();
    
    // We compare raw timestamps from browser (nowMs) against ISO strings from server (which contain offsets).
    // This is the most reliable way to align wall-clock time.
    const isNight = nowMs >= new Date(prediction.astronomy.sunset).getTime() && nowMs < new Date(prediction.astronomy.nextSunrise).getTime();
    
    // Paksha is determined by the server for that specific day/night.
    const currentPaksha = isNight ? prediction.paksha?.night : prediction.paksha?.day;

    return {
      date: prediction.date,
      weekday: prediction.weekday,
      paksha: currentPaksha,
      dayPaksha: prediction.paksha?.day,
      nightPaksha: prediction.paksha?.night,
      sunrise: prediction.astronomy.sunrise,
      sunset: prediction.astronomy.sunset,
      currentHorai: (() => {
        const horas = prediction.horai;
        if (!horas || !horas.length) return null;
        // Search by timestamp — robust against local timezone shifts
        return horas.find(h => nowMs >= new Date(h.start).getTime() && nowMs < new Date(h.end).getTime());
      })(),
      currentGowri: (() => {
        const gowris = prediction.gowri;
        if (!gowris || !gowris.length) return null;
        return gowris.find(g => nowMs >= new Date(g.start).getTime() && nowMs < new Date(g.end).getTime());
      })()
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

  async function handleRangePrint({ fromDate, toDate, categories, showSubTable }) {
    setPrintLoading(true);
    setRangeData(null);
    setPrintSubTable(showSubTable);
    try {
      const data = await requestRangeSchedule({
        fromDate,
        toDate,
        birdId: Number(birdId),
        place: { latitude: lat, longitude: lng, name: locationName, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        categories,
      });
      setRangeData(data);
      setRangeCategories(categories);
      setRangeDates({ from: fromDate, to: toDate });
      setShowPrintModal(false);
      
      // We'll use a small delay to ensure React has rendered the data into the hidden div (RangePrintView) 
      // even though it's display: none, before we grab its HTML.
      setTimeout(() => {
        const printEl = document.getElementById('range-print-view');
        if (printEl) {
          executeIsolatedPrint(printEl.innerHTML, lang === 'ta' ? 'பஞ்சபட்சி அட்டவணை' : 'Pancha Pakshi Schedule');
        }
      }, 300);
    } catch (err) {
      alert(err.message || 'Failed to generate range schedule');
    } finally {
      setPrintLoading(false);
    }
  }

  async function handlePrintAction() {
    const dp = user?.downloadPermissions?.neram || { allowed: false, requestStatus: 'none' };
    if (dp.allowed) {
      setShowPrintModal(true);
    } else {
      setShowRequestModal(true);
    }
  }

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requesting, setRequesting] = useState(false);

  async function handleRequestAccess() {
    setRequesting(true);
    try {
      await requestDownloadAccess('neram');
      setShowRequestModal(false);
      alert(lang === 'ta' ? 'விண்ணப்பம் அனுப்பப்பட்டது!' : 'Request sent successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setRequesting(false);
    }
  }

  function handleSinglePrint({ showSubTable }) {
    setShowPrintModal(false);
    setPrintSubTable(showSubTable);
    setTimeout(async () => {
      const printEl = document.getElementById('print-view');
      if (printEl) {
        executeIsolatedPrint(printEl.innerHTML, lang === 'ta' ? 'பஞ்சபட்சி அட்டவணை' : 'Pancha Pakshi Schedule');
        try { await recordDownload('neram'); } catch (e) { console.error(e); }
      }
    }, 200);
  }

  function executeIsolatedPrint(htmlContent, title) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=Noto+Sans+Tamil:wght@400;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; }
            @media print {
              @page { margin: 1cm; size: auto; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            /* Add basic resets for the template */
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          <div style="width: 100%;">${htmlContent}</div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.frameElement.remove(); }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  }

  function formatTimeFromISO(iso) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }

  function formatDateDisplay(d) {
    return new Date(d).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const renderConfig = (isSidebar = false) => (
    <section className={`glass-card shadow-card-sm border-none ring-1 ring-slate-100/80 bg-white/80 ${isSidebar ? 'p-4 sm:p-6' : 'p-4 sm:p-6 md:p-8'}`}>
      <div className="flex items-center gap-3 mb-4 sm:mb-6 md:mb-8">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        <h3 className="text-base font-black uppercase tracking-[0.25em] text-slate-900">
          {lang === 'ta' ? 'அமைப்பு' : 'Configuration'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className={`grid grid-cols-1 ${isSidebar ? 'gap-4 sm:gap-6' : 'md:grid-cols-12 gap-x-6 sm:gap-x-10 gap-y-5 sm:gap-y-8'}`}>
          
          {/* ROW 1: DATE & LOCATION */}
          <div className={`${isSidebar ? '' : 'md:col-span-4'} flex flex-col gap-2.5`}>
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">{t.date_label}</label>
            <div className="relative group">
              <input
                type="date"
                className="input-field py-3.5 bg-slate-50/50 border-slate-200 group-hover:bg-white group-hover:border-amber-400 group-hover:ring-8 group-hover:ring-amber-500/5 transition-all text-base font-bold pl-4 pr-16"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-amber-100/50 hover:bg-amber-400 hover:text-white rounded-md text-[11px] font-black uppercase tracking-tighter text-amber-700 active:scale-95 transition-all"
              >
                Today
              </button>
            </div>
          </div>

          <div className={`${isSidebar ? '' : 'md:col-span-8'} flex flex-col gap-2.5 relative`}>
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">{t.location_label}</label>
            <div className="relative group">
              <div className={`flex flex-col ${isSidebar ? 'gap-3' : 'sm:flex-row gap-3'}`}>
                <input
                  type="text"
                  className="input-field py-3.5 flex-1 bg-slate-50/50 border-slate-200 group-hover:bg-white group-hover:border-amber-400 group-hover:ring-8 group-hover:ring-amber-500/5 transition-all text-sm font-bold"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    setUseGeo(false);
                  }}
                  onFocus={() => results.length > 0 && setShowResults(true)}
                  placeholder="City name..."
                />
                
                <div className={`px-5 py-2.5 bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between ${isSidebar ? 'w-full' : 'min-w-[220px]'}`}>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter leading-none mb-1">Coordinates</span>
                    <span className="text-xs font-black text-indigo-500 tabular-nums">
                      {lat.toFixed(3)}, {lng.toFixed(3)}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none group/geo">
                    <div className={`w-3.5 h-3.5 rounded border transition-all ${useGeo ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300 group-hover/geo:border-amber-400'}`}>
                      {useGeo && <IconCheck size={8} className="text-white mx-auto mt-0.5" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={useGeo}
                      onChange={(e) => setUseGeo(e.target.checked)}
                      className="hidden"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Use My GPS</span>
                  </label>
                </div>
              </div>
              
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
                        <div className="text-xs font-black text-slate-800 line-clamp-2 group-hover/item:text-amber-600 transition-colors uppercase tracking-tight">
                          {r.label}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 tabular-nums">
                          {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isSidebar && <div className="md:col-span-12 h-px bg-slate-100/50" />}

          {/* ROW 2: BIRD, PAKSHA & BUTTON */}
          <div className={`${isSidebar ? '' : 'md:col-span-5'} flex flex-col gap-2.5`}>
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">{t.bird_label}</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {birdOptions.map((bird) => (
                <button
                  key={bird.id}
                  type="button"
                  onClick={() => setBirdId(String(bird.id))}
                  className={`aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all border-2 ${
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
                  <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest text-slate-700 opacity-80">
                    {lang === 'ta' ? bird.tamil : bird.key}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`${isSidebar ? '' : 'md:col-span-4'} flex flex-col gap-2.5`}>
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">{t.paksha_type}</label>
            <div className="flex gap-1 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100 flex-1 min-h-[48px]">
              <button 
                type="button"
                onClick={() => { setPaksha('bright'); setAutoPaksha(false); }}
                className={`flex-1 py-3 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all ${paksha === 'bright' && !autoPaksha ? 'bg-amber-400 text-amber-950 shadow-md ring-1 ring-amber-500/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                {lang === 'ta' ? 'வளர்பிறை' : 'Bright'}
              </button>
              <button 
                type="button"
                onClick={() => { setPaksha('dark'); setAutoPaksha(false); }}
                className={`flex-1 py-3 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all ${paksha === 'dark' && !autoPaksha ? 'bg-amber-400 text-amber-950 shadow-md ring-1 ring-amber-500/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                {lang === 'ta' ? 'தேய்பிறை' : 'Dark'}
              </button>
              <button 
                type="button"
                onClick={() => setAutoPaksha(true)}
                className={`flex-1 py-3 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all ${autoPaksha ? 'bg-amber-400 text-amber-950 shadow-md ring-1 ring-amber-500/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                {t.auto}
              </button>
            </div>
          </div>

          <div className={`${isSidebar ? '' : 'md:col-span-3'} flex items-end`}>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary ${isSidebar ? 'w-full mt-2' : 'h-[64px] w-full'}`}
            >
              {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-amber-950/20 border-t-amber-950 rounded-full animate-spin" />
                    <span className="ml-1">{t.generating}</span>
                  </>
              ) : (
                <>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">{t.generate}</span>
                  <IconArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>
      </form>

      {error && (
        <div className="mt-8 bg-rose-50 border border-rose-100 text-rose-600 px-6 py-5 rounded-2xl text-xs font-black uppercase tracking-wide flex items-start gap-4 animate-in shake duration-500">
          <div className="w-6 h-6 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 font-black">!</div>
          <div className="flex-1 leading-normal">{error}</div>
        </div>
      )}
    </section>
  );

  return (
    <>
    <PortalShell title={t.title} lang={lang} onToggleLang={() => setLang(lang === 'ta' ? 'en' : 'ta')}>
      <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start">

        {/* CONFIG SIDEBAR */}
        <aside className="no-print w-full xl:w-[380px] shrink-0 space-y-4 sm:space-y-6 xl:sticky xl:top-[88px] max-h-none xl:max-h-[calc(100vh-120px)] overflow-y-auto pr-0 xl:pr-2 pb-10 sm:pb-20 scrollbar-hide">
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

        </aside>

        {/* MAIN RESULTS AREA */}
        <div className="flex-1 min-w-0 w-full space-y-10 min-h-[800px]">
          {prediction && summary ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000">
              
              <div className="no-print mb-12">
                {renderConfig(false)}
              </div>

              {/* PRINT VIEWS (hidden on screen) */}
              <PrintView prediction={prediction} lang={lang} locationName={locationName} showSubTable={printSubTable} branding={branding} />
              <RangePrintView
                rangeData={rangeData}
                categories={rangeCategories}
                lang={lang}
                locationName={locationName}
                fromDate={rangeDates.from}
                toDate={rangeDates.to}
                branding={branding}
              />

              {/* PRINT BUTTON */}
              <div className="no-print flex justify-end">
                <button
                  onClick={handlePrintAction}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all ${
                    (user?.downloadPermissions?.neram?.allowed)
                      ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/20'
                      : 'bg-white border border-slate-200 text-slate-400 hover:border-amber-500 hover:text-amber-500 shadow-slate-200/50'
                  }`}
                >
                   {(user?.downloadPermissions?.neram?.allowed) ? <IconDownload size={18} /> : <IconLock size={18} />}
                   {lang === 'ta' ? 'PDF பதிவிறக்கம்' : 'Download PDF'}
                   {!(user?.downloadPermissions?.neram?.allowed) && (
                     <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded-[4px] text-[8px]">LOCKED</span>
                   )}
                </button>
              </div>

              {/* SUMMARY DASHBOARD */}
              <div className="no-print space-y-8">
                <SpecialPeriods periods={prediction.specialPeriods} lang={lang} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {[
                    { label: t.date_label, value: formatDateDisplay(summary.date) },
                    { label: t.weekday, value: lang === 'ta' ? summary.weekday.tamil : summary.weekday.label, highlight: 'text-amber-600' },
                    { 
                      label: lang === 'ta' ? 'சூரிய உதயம் & அஸ்தமனம்' : 'Sunrise & Sunset', 
                      span: 'md:col-span-2',
                      node: (
                        <div className="flex items-center gap-4 py-1">
                          <div className="flex items-center gap-2 text-indigo-600">
                            <IconSunrise size={16} className="opacity-80" />
                            <span className="text-sm font-black font-mono whitespace-nowrap">{formatTimeFromISO(summary.sunrise)}</span>
                          </div>
                          <div className="w-px h-4 bg-slate-200" />
                          <div className="flex items-center gap-2 text-orange-600">
                            <IconSunset size={16} className="opacity-80" />
                            <span className="text-sm font-black font-mono whitespace-nowrap">{formatTimeFromISO(summary.sunset)}</span>
                          </div>
                        </div>
                      )
                    },
                    { label: t.paksha, value: lang === 'ta' ? summary.paksha?.tamil : summary.paksha?.label, badge: 'emerald' },
                    { 
                      label: lang === 'ta' ? 'இந்த நேரத்தின் ஹோரை' : 'Current Horai',
                      node: summary.currentHorai ? (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50 text-amber-700 shadow-sm ring-1 ring-white">
                          <IconSun size={14} className="animate-spin-slow" />
                          <span className="text-xs font-black uppercase">
                            {lang === 'ta' ? summary.currentHorai.planet.tamil : summary.currentHorai.planet.label}
                          </span>
                        </div>
                      ) : <span className="text-slate-300">—</span>
                    }
                  ].map((item, idx) => (
                    <div key={idx} className={`glass-card shadow-card-sm p-3 sm:p-5 border-none ring-1 ring-slate-100/50 flex flex-col justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] transition-all ${item.span || ''}`}>
                        <span className="text-xs sm:text-base font-black uppercase tracking-wider sm:tracking-widest text-slate-800">{item.label}</span>
                        {item.node ? item.node : (
                          <span className={`text-base font-black ${item.highlight || 'text-slate-800'} ${item.mono ? 'font-mono text-sm' : ''}`}>
                             {item.badge ? (
                               <span className={`px-3 py-1 rounded-lg text-xs uppercase font-black tracking-wider ${item.badge === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-indigo-50 text-indigo-600 border border-indigo-100/50'}`}>
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
                <ScheduleTable tone="day" yamas={prediction.dayYamas} lang={lang} specialPeriods={prediction.specialPeriods} horai={prediction.horai} gowri={prediction.gowri} />
                <ScheduleTable tone="night" yamas={prediction.nightYamas} lang={lang} specialPeriods={prediction.specialPeriods} horai={prediction.horai} gowri={prediction.gowri} />
                
                <HoraiTable horai={prediction.horai} lang={lang} />
                <GowriTable gowri={prediction.gowri} lang={lang} />
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[600px] py-6 sm:py-10">
              <div className="max-w-5xl w-full animate-in zoom-in-95 duration-700">
                <div className="text-center mb-6 sm:mb-10">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto mb-4 sm:mb-6 shadow-sm ring-1 ring-amber-500/10 animate-slow-bounce">
                    <IconCalendar size={32} className="sm:hidden" />
                    <IconCalendar size={48} className="hidden sm:block" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                    {lang === 'ta' ? 'ஜாதகக் கணிப்பு' : 'Schedule Generator'}
                  </h2>
                  <p className="text-slate-800 font-bold uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs leading-loose px-4 sm:px-0">
                    {lang === 'ta' ? 'தேதி மற்றும் இடத்தைத் தேர்வுசெய்து உங்கள் அட்டவணையைப் பெறுங்கள்' : 'Select date and location to generate your astrological schedule.'}
                  </p>
                </div>
                {renderConfig(false)}
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalShell>

    {showPrintModal && (
      <PrintOptionsModal
        lang={lang}
        currentDate={date}
        loading={printLoading}
        onClose={() => setShowPrintModal(false)}
        onPrintSingle={handleSinglePrint}
        onPrintRange={handleRangePrint}
      />
    )}

    {showRequestModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-200">
           <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <IconLock size={40} />
           </div>
           <h3 className="text-3xl font-black text-slate-900 mb-2">
             {lang === 'ta' ? 'அனுமதி தேவை' : 'Access Restricted'}
           </h3>
           <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
             {lang === 'ta' 
               ? 'PDF பதிவிறக்கம் செய்ய உங்களுக்கு அனுமதி இல்லை. பதிவிறக்க வசதியை பெற நிர்வாகியிடம் விண்ணப்பம் அனுப்பவும்.' 
               : 'You do not have permission to download reports. Please send a request to the administrator to enable this feature for your account.'}
           </p>

           <div className="space-y-3">
             {user?.downloadPermissions?.neram?.requestStatus === 'pending' ? (
                <div className="w-full py-5 bg-slate-100 text-slate-400 text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2 border border-slate-200">
                   <IconClock size={16} />
                   {lang === 'ta' ? 'விண்ணப்பம் நிலுவையில் உள்ளது' : 'Request Pending Approval'}
                </div>
             ) : (
                <button onClick={handleRequestAccess} disabled={requesting} className="w-full py-5 bg-amber-500 text-white text-xs font-black uppercase rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                   {requesting ? '...' : (lang === 'ta' ? 'நிர்வாகியிடம் அனுமதி கோரவும்' : 'Send Request to Admin')}
                </button>
             )}
             
             <button onClick={() => setShowRequestModal(false)} className="w-full py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">
               {lang === 'ta' ? 'பிறகு செய்' : 'Maybe Later'}
             </button>
           </div>
        </div>
      </div>
    )}
    </>
  );
}
