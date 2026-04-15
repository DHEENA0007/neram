import { useEffect, useMemo, useState } from 'react';
import { birdOptions, pakshaOptions } from '../../shared/constants.js';
import { requestPrediction } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { PlaceAutocomplete } from '../../components/PlaceAutocomplete.jsx';
import { PortalShell } from '../../components/PortalShell.jsx';
import { ScheduleTable } from '../../components/ScheduleTable.jsx';
import { NameBirdSection } from '../../components/NameBirdSection.jsx';
import { GowriTable } from '../../components/GowriTable.jsx';
import { BirdHelper } from '../../components/BirdHelper.jsx';
import { IconArrowRight, IconVulture, IconOwl, IconCrow, IconHen, IconPeacock, IconCheck, IconCalendar, IconLocation, IconSun, IconSearch } from '../../components/Icons.jsx';





const BIRD_ICONS = {
  vulture: IconVulture,
  owl: IconOwl,
  crow: IconCrow,
  cock: IconHen,
  peacock: IconPeacock
};

const L = {
  en: {
    date: 'Date',
    place: 'Place',
    bird: 'Bird',
    pakshaMode: 'Paksha Mode',
    markDefault: 'Mark this as default location',
    generate: 'Generate',
    generating: 'Generating...',
    clear: 'Clear results',
    today: 'Today',
    auto: 'Auto',
    readyTitle: 'Ready when you are',
    readyBody: 'Enter a date, choose a place and pick one of the five birds to generate the full table.',
    date_label: 'Date',
    weekday: 'Day',
    sunrise: 'Sunrise',
    paksha: 'Paksha',
  },
  ta: {
    date: 'தேதி',
    place: 'இடம்',
    bird: 'பட்சி',
    pakshaMode: 'பிறை வகை',
    markDefault: 'இதை இயல்புநிலை இடமாக குறி',
    generate: 'காண்பி',
    generating: 'கணக்கிடுகிறது...',
    clear: 'அழி',
    today: 'Today',
    auto: 'தானியங்கி',
    readyTitle: 'தயார்',
    readyBody: 'தேதி, இடம் மற்றும் பட்சி தேர்வு செய்து அட்டவணையை காண்க.',
    date_label: 'தேதி',
    weekday: 'நாள்',
    sunrise: 'சூரிய உதயம்',
    paksha: 'பிறை',
  },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateDisplay(iso) {
  const [year, month, day] = iso.split('-');
  return `${day}-${month}-${year}`;
}

function formatTimeFromISO(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function UserPortal() {
  const { user, refresh } = useAuth();
  const [lang, setLang] = useState('ta');
  const t = L[lang];

  const [date, setDate] = useState(todayISO());
  const [birdId, setBirdId] = useState(() => localStorage.getItem('neram-bird-id') || '1');
  const [pakshaMode, setPakshaMode] = useState(() => localStorage.getItem('neram-paksha-mode') || 'auto');
  const [placeQuery, setPlaceQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [saveDefaultPlace, setSaveDefaultPlace] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => { localStorage.setItem('neram-bird-id', birdId); }, [birdId]);
  useEffect(() => { localStorage.setItem('neram-paksha-mode', pakshaMode); }, [pakshaMode]);

  useEffect(() => {
    if (user?.defaultPlace) {
      setSelectedPlace(user.defaultPlace);
      setPlaceQuery(user.defaultPlace.label || user.defaultPlace.name || '');
    }
  }, [user?.defaultPlace]);

  const summary = useMemo(() => {
    if (!prediction) return null;
    const now = new Date().toISOString();
    const isNight = now >= prediction.astronomy.sunset && now < prediction.astronomy.nextSunrise;
    const currentPaksha = isNight ? prediction.paksha.night : prediction.paksha.day;

    return {
      date: prediction.date,
      weekday: prediction.weekday,
      paksha: currentPaksha,
      sunrise: prediction.astronomy.sunrise,
      currentHorai: prediction.horai?.find(h => now >= h.start && now < h.end),
      currentGowri: prediction.gowri?.find(g => now >= g.start && now < g.end)
    };
  }, [prediction]);




  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const placeToUse = selectedPlace || user?.defaultPlace;
    try {
      const data = await requestPrediction({
        date,
        birdId: Number(birdId),
        place: placeToUse,
        pakshaMode,
        saveDefaultPlace,
      });
      setPrediction(data.schedule);
      if (saveDefaultPlace) await refresh();
    } catch (err) {
      setError(err.message || 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PortalShell
      title="பஞ்சபட்சி"
      subtitle="Pancha Pakshi Schedule"
      lang={lang}
      onToggleLang={() => setLang((l) => (l === 'ta' ? 'en' : 'ta'))}
    >
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


      <section className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.date}</label>
            <div className="flex gap-2">
              <input
                className="input-field"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button className="btn-ghost" type="button" onClick={() => setDate(todayISO())}>{t.today}</button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.place}</label>
            <div className="relative">
               <PlaceAutocomplete
                value={placeQuery}
                onChange={setPlaceQuery}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                label=""
                className="input-field"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-yellow-500 border-slate-200 rounded"
                  checked={saveDefaultPlace}
                  onChange={(e) => setSaveDefaultPlace(e.target.checked)}
                />
                <span className="text-xs font-bold text-slate-400 group-hover:text-yellow-600 transition-colors">{t.markDefault}</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.bird}</label>
            <div className="relative group/bird">
              <button 
                type="button" 
                className="input-field flex items-center justify-between gap-3 text-left w-full h-10 px-4"
                onClick={() => document.getElementById('bird-dropdown').classList.toggle('hidden')}
              >
                <div className="flex items-center gap-2">
                    {(() => {
                        const bird = birdOptions.find(b => b.id === Number(birdId));
                        const Icon = BIRD_ICONS[bird?.key || 'vulture'];
                        return <Icon size={18} className="text-amber-500" />;
                    })()}
                    <span className="text-sm font-medium">
                        {lang === 'ta' ? birdOptions.find(b => b.id === Number(birdId))?.tamil : birdOptions.find(b => b.id === Number(birdId))?.label}
                    </span>
                </div>
                <IconArrowRight size={14} className="rotate-90 opacity-40" />
              </button>
              
              <div id="bird-dropdown" className="hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="p-2 flex flex-col gap-1">
                  {birdOptions.map((bird) => {
                    const Icon = BIRD_ICONS[bird.key];
                    const isActive = Number(birdId) === bird.id;
                    return (
                      <button
                        key={bird.id}
                        type="button"
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'hover:bg-slate-50 text-slate-700'}`}
                        onClick={() => {
                          setBirdId(String(bird.id));
                          document.getElementById('bird-dropdown').classList.add('hidden');
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <Icon size={22} className={isActive ? 'text-white' : 'text-slate-500'} />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className={`text-sm font-black leading-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>{lang === 'ta' ? bird.tamil : bird.label}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>{bird.key}</span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <IconCheck size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.pakshaMode}</label>
            <div className="flex flex-wrap gap-2">
              {pakshaOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 text-sm ${pakshaMode === opt.key ? 'bg-yellow-100 border-yellow-500 text-yellow-900 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-yellow-200'}`}
                  onClick={() => setPakshaMode(opt.key)}
                >
                  {lang === 'ta' ? opt.tamil : opt.label}
                </button>
              ))}
              <button
                type="button"
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 text-sm ${pakshaMode === 'auto' ? 'bg-yellow-100 border-yellow-500 text-yellow-900 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-yellow-200'}`}
                onClick={() => setPakshaMode('auto')}
              >
                {t.auto}
              </button>
            </div>
          </div>

          <div className="flex items-end justify-end md:pt-2">
            <button 
              className="btn-primary w-full py-3 text-sm shadow-xl shadow-yellow-500/20" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? t.generating : t.generate}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-6 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}
      </section>

      {prediction && summary && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SpecialPeriods periods={prediction.specialPeriods} lang={lang} />
          
          <div className="glass-card shadow-card-sm overflow-hidden p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-yellow-400/10 text-[10px] font-black uppercase tracking-widest text-yellow-600/70 border-b border-yellow-100">
                  <th className="px-8 py-3">{t.date_label}</th>
                  <th className="px-8 py-3">{t.weekday}</th>
                  <th className="px-8 py-3">{t.sunrise}</th>
                  <th className="px-8 py-3">{t.paksha}</th>
                  <th className="px-8 py-3">{lang === 'ta' ? 'திசை' : 'Direction'}</th>
                  <th className="px-8 py-3">{lang === 'ta' ? 'தற்போதைய ஹோரை' : 'Current Horai'}</th>
                  <th className="px-8 py-3">{lang === 'ta' ? 'கௌரி' : 'Gowri'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm font-bold text-slate-800">
                  <td className="px-8 py-4">{formatDateDisplay(summary.date)}</td>
                  <td className="px-8 py-4">{lang === 'ta' ? summary.weekday.tamil : summary.weekday.label}</td>
                  <td className="px-8 py-4">{formatTimeFromISO(summary.sunrise)}</td>
                  <td className="px-8 py-4 text-emerald-600 uppercase tracking-tighter">
                    {lang === 'ta' ? summary.paksha?.tamil : summary.paksha?.label}
                  </td>
                  <td className="px-8 py-4 text-indigo-600 font-bold uppercase">
                    {lang === 'ta' ? summary.paksha?.direction?.tamil : summary.paksha?.direction?.label}
                  </td>
                  <td className="px-8 py-4">
                    {summary.currentHorai ? (
                      <div className="flex items-center gap-2">
                        <IconSun size={14} className="text-amber-500" />
                        <span className="text-amber-600">
                          {lang === 'ta' ? summary.currentHorai.planet.tamil : summary.currentHorai.planet.label}
                        </span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-8 py-4">
                    {summary.currentGowri ? (
                       <span className={summary.currentGowri.type.nature === 'good' ? 'text-emerald-600' : 'text-rose-600'}>
                          {lang === 'ta' ? summary.currentGowri.type.tamil : summary.currentGowri.type.label}
                       </span>
                    ) : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {prediction ? (
        <div className="space-y-12">
          <ScheduleTable tone="day" yamas={prediction.dayYamas} lang={lang} />
          <ScheduleTable tone="night" yamas={prediction.nightYamas} lang={lang} />
          
          <HoraiTable horai={prediction.horai} lang={lang} />
          
          <GowriTable gowri={prediction.gowri} lang={lang} />

          <div className="text-center pb-20">

             <button className="btn-ghost" onClick={() => { setPrediction(null); setError(''); }}>
               {t.clear}
             </button>
          </div>
        </div>
      ) : (
        !loading && (
          <section className="py-12 text-center glass-card bg-transparent border-dashed border-2 border-amber-200">
            <div className="text-3xl mb-3 text-amber-500/40"><IconCalendar size={48} className="mx-auto" /></div>
            <h2 className="text-xl font-black text-slate-800 mb-1">{t.readyTitle}</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{t.readyBody}</p>
          </section>
        )
      )}
    </PortalShell>

  );
}
