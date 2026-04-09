import { useEffect, useMemo, useState } from 'react';
import { birdOptions, pakshaOptions } from '../../shared/constants.js';
import { requestPrediction } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { PlaceAutocomplete } from '../../components/PlaceAutocomplete.jsx';
import { PortalShell } from '../../components/PortalShell.jsx';
import { ScheduleTable } from '../../components/ScheduleTable.jsx';

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
      <form className="pp-form" onSubmit={handleSubmit}>
        {/* Date */}
        <div className="pp-field">
          <div className="pp-field-head">
            <label>{t.date}</label>
            <button type="button" className="pp-today-btn" onClick={() => setDate(todayISO())}>
              {t.today}
            </button>
          </div>
          <input
            className="text-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Place */}
        <div className="pp-field">
          <div className="pp-field-head">
            <label>{t.place}</label>
            <label className="pp-default-check">
              <input
                type="checkbox"
                checked={saveDefaultPlace}
                onChange={(e) => setSaveDefaultPlace(e.target.checked)}
              />
              <span>{t.markDefault}</span>
            </label>
          </div>
          <PlaceAutocomplete
            value={placeQuery}
            onChange={setPlaceQuery}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            label=""
          />
        </div>

        {/* Bird */}
        <div className="pp-field">
          <label>{t.bird}</label>
          <select className="text-input" value={birdId} onChange={(e) => setBirdId(e.target.value)}>
            {birdOptions.map((bird) => (
              <option key={bird.id} value={bird.id}>
                {lang === 'ta' ? bird.tamil : bird.label}
              </option>
            ))}
          </select>
        </div>

        {/* Paksha + Actions row */}
        <div className="pp-field pp-span2">
          <label>{t.pakshaMode}</label>
          <div className="segmented-control">
            {pakshaOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={pakshaMode === opt.key ? 'segment active' : 'segment'}
                onClick={() => setPakshaMode(opt.key)}
              >
                {lang === 'ta' ? opt.tamil : opt.label}
              </button>
            ))}
            <button
              type="button"
              className={pakshaMode === 'auto' ? 'segment active' : 'segment'}
              onClick={() => setPakshaMode('auto')}
            >
              {t.auto}
            </button>
          </div>
        </div>

        <div className="pp-actions">
          <button className="primary-button" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? t.generating : t.generate}
          </button>
          {prediction && (
            <button
              className="ghost-button"
              type="button"
              onClick={() => { setPrediction(null); setError(''); }}
            >
              {t.clear}
            </button>
          )}
        </div>

        {error && <div className="error-banner pp-full">{error}</div>}
      </form>

      {/* Summary row */}
      {summary && (
        <div className="pp-summary-wrap">
          <table className="pp-summary-table">
            <thead>
              <tr>
                <th>{t.date_label}</th>
                <th>{t.weekday}</th>
                <th>{t.sunrise}</th>
                <th>{t.paksha}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatDateDisplay(summary.date)}</td>
                <td>{lang === 'ta' ? summary.weekday.tamil : summary.weekday.label}</td>
                <td>{formatTimeFromISO(summary.sunrise)}</td>
                <td>{lang === 'ta' ? summary.paksha.tamil : summary.paksha.label}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tables */}
      {prediction ? (
        <div className="schedule-stack">
          <ScheduleTable
            tone="day"
            yamas={prediction.dayYamas}
            lang={lang}
          />
          <ScheduleTable
            tone="night"
            yamas={prediction.nightYamas}
            lang={lang}
          />
        </div>
      ) : (
        !loading && (
          <section className="empty-state">
            <h2>{t.readyTitle}</h2>
            <p>{t.readyBody}</p>
          </section>
        )
      )}
    </PortalShell>
  );
}
