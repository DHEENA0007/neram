import { useEffect, useMemo, useState } from 'react';
import { birdOptions, pakshaOptions } from '../../shared/constants.js';
import { requestPrediction } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { PlaceAutocomplete } from '../../components/PlaceAutocomplete.jsx';
import { PortalShell } from '../../components/PortalShell.jsx';
import { ScheduleTable } from '../../components/ScheduleTable.jsx';
import { NameBirdSection } from '../../components/NameBirdSection.jsx';

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
    return {
      date: prediction.date,
      weekday: prediction.weekday,
      paksha: prediction.paksha,
      sunrise: prediction.astronomy.sunrise,
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
            <select 
              className="input-field cursor-pointer appearance-none" 
              value={birdId} 
              onChange={(e) => setBirdId(e.target.value)}
            >
              {birdOptions.map((bird) => (
                <option key={bird.id} value={bird.id}>
                  {lang === 'ta' ? bird.tamil : bird.label}
                </option>
              ))}
            </select>
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

      {summary && (
        <div className="glass-card shadow-card-sm overflow-hidden p-0 animate-in fade-in duration-500">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-yellow-400/10 text-[10px] font-black uppercase tracking-widest text-yellow-600/70 border-b border-yellow-100">
                <th className="px-8 py-3">{t.date_label}</th>
                <th className="px-8 py-3">{t.weekday}</th>
                <th className="px-8 py-3">{t.sunrise}</th>
                <th className="px-8 py-3">{t.paksha}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-sm font-bold text-slate-800">
                <td className="px-8 py-4">{formatDateDisplay(summary.date)}</td>
                <td className="px-8 py-4">{lang === 'ta' ? summary.weekday.tamil : summary.weekday.label}</td>
                <td className="px-8 py-4">{formatTimeFromISO(summary.sunrise)}</td>
                <td className="px-8 py-4 text-emerald-600 uppercase tracking-tighter">
                   {lang === 'ta' ? summary.paksha.tamil : summary.paksha.label}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {prediction ? (
        <div className="space-y-12">
          <ScheduleTable tone="day" yamas={prediction.dayYamas} lang={lang} />
          <ScheduleTable tone="night" yamas={prediction.nightYamas} lang={lang} />
          
          <div className="text-center pb-20">
             <button className="btn-ghost" onClick={() => { setPrediction(null); setError(''); }}>
               {t.clear}
             </button>
          </div>
        </div>
      ) : (
        !loading && (
          <section className="py-12 text-center glass-card bg-transparent border-dashed border-2 border-amber-200">
            <div className="text-3xl mb-3">✨</div>
            <h2 className="text-xl font-black text-slate-800 mb-1">{t.readyTitle}</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{t.readyBody}</p>
          </section>
        )
      )}
    </PortalShell>
  );
}
