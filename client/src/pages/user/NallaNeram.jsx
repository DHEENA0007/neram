import React, { useState, useMemo } from 'react';
import { birdOptions } from '../../shared/constants.js';
import { requestPrediction } from '../../api.js';
import { PortalShell } from '../../components/PortalShell.jsx';
import { IconVulture, IconOwl, IconCrow, IconHen, IconPeacock } from '../../components/Icons.jsx';

const BIRD_ICONS = {
  vulture: IconVulture, owl: IconOwl, crow: IconCrow, cock: IconHen, peacock: IconPeacock,
};

// Good horai planets (traditional: Jupiter best, then Venus, Mercury, Moon, Sun)
const GOOD_HORAI = new Set(['jupiter', 'venus', 'mercury', 'moon', 'sun']);

const PLANET_COLOR = {
  sun: 'bg-orange-400', moon: 'bg-slate-400', mars: 'bg-red-500',
  mercury: 'bg-teal-500', jupiter: 'bg-amber-400', venus: 'bg-pink-400', saturn: 'bg-slate-700',
};

// Primary Pancha Pakshi filter — ruling & eating are auspicious
const GOOD_ACTIVITY = new Set(['ruling', 'eating']);

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function getHoraiForSlot(s, e, horai) {
  if (!horai) return null;
  const mid = (s + e) / 2;
  return horai.find(h => mid >= new Date(h.start).getTime() && mid < new Date(h.end).getTime()) ?? null;
}

function getGowriForSlot(s, e, gowri) {
  if (!gowri) return null;
  const mid = (s + e) / 2;
  return gowri.find(g => mid >= new Date(g.start).getTime() && mid < new Date(g.end).getTime()) ?? null;
}

const FILTER_OPTIONS = [
  { key: 'horai', ta: 'ஹோரை',      en: 'Horai' },
  { key: 'gowri', ta: 'கௌரி',       en: 'Gowri' },
  { key: 'rahu',  ta: 'ராகு காலம்', en: 'Rahu Kalam' },
  { key: 'yama',  ta: 'எமகண்டம்',   en: 'Yamagandam' },
];

const ACTIVITY_STYLE = {
  ruling:   { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  eating:   { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  walking:  { bg: 'bg-blue-100',    text: 'text-blue-600'    },
  sleeping: { bg: 'bg-violet-100',  text: 'text-violet-600'  },
  dying:    { bg: 'bg-rose-100',    text: 'text-rose-600'    },
};

export function NallaNeram() {
  const [lang, setLang] = useState('ta');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [birdId, setBirdId] = useState(null);
  const [filters, setFilters] = useState({ horai: true, gowri: true, rahu: true, yama: true });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleFilter(key) {
    setFilters(f => ({ ...f, [key]: !f[key] }));
  }

  async function handleGenerate() {
    if (!birdId) {
      setError(lang === 'ta' ? 'பட்சி தேர்வு செய்யவும்' : 'Please select a bird');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await requestPrediction({
        date,
        birdId: Number(birdId),
        pakshaMode: 'auto',
        place: {
          latitude: 10.9577,
          longitude: 78.0810,
          name: 'Tamil Nadu, India',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      setPrediction(data.schedule ?? data);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  const { nallaSlots, avoidPeriods } = useMemo(() => {
    if (!prediction) return { nallaSlots: [], avoidPeriods: [] };

    const { horai, gowri, specialPeriods, dayYamas, nightYamas } = prediction;

    const rahuS = specialPeriods?.rahu        ? new Date(specialPeriods.rahu.start).getTime()        : null;
    const rahuE = specialPeriods?.rahu        ? new Date(specialPeriods.rahu.end).getTime()          : null;
    const yamaS = specialPeriods?.yamagandam  ? new Date(specialPeriods.yamagandam.start).getTime()  : null;
    const yamaE = specialPeriods?.yamagandam  ? new Date(specialPeriods.yamagandam.end).getTime()    : null;
    const kuliS = specialPeriods?.kulikai     ? new Date(specialPeriods.kulikai.start).getTime()     : null;
    const kuliE = specialPeriods?.kulikai     ? new Date(specialPeriods.kulikai.end).getTime()       : null;

    // Collect all sub-rows (finest granularity ~28 min each)
    const allSubs = [
      ...(dayYamas || []).flatMap(y => y.subRows.map(s => ({ ...s, period: 'day' }))),
      ...(nightYamas || []).flatMap(y => y.subRows.map(s => ({ ...s, period: 'night' }))),
    ];

    const nallaSlots = [];

    for (const sub of allSubs) {
      const s = new Date(sub.start).getTime();
      const e = new Date(sub.end).getTime();

      // PRIMARY: Pancha Pakshi activity must be ruling or eating
      if (!GOOD_ACTIVITY.has(sub.activity?.key)) continue;

      const horaSlot  = getHoraiForSlot(s, e, horai);
      const gowriSlot = getGowriForSlot(s, e, gowri);

      const isRahu = rahuS != null && overlaps(s, e, rahuS, rahuE);
      const isYama = yamaS != null && overlaps(s, e, yamaS, yamaE);
      const isKuli = kuliS != null && overlaps(s, e, kuliS, kuliE);

      const isGoodHorai = horaSlot ? GOOD_HORAI.has(horaSlot.planet.key) : true;
      const isGoodGowri = gowriSlot ? gowriSlot.type.nature === 'good' : true;

      // Apply selected filters
      if (filters.rahu  && isRahu)       continue;
      if (filters.yama  && isYama)       continue;
      if (filters.horai && !isGoodHorai) continue;
      if (filters.gowri && !isGoodGowri) continue;
      // Always exclude kulikai as it's universally inauspicious
      if (isKuli) continue;

      nallaSlots.push({ sub, horaSlot, gowriSlot, isRahu, isYama });
    }

    // Collect avoid periods for display
    const avoidPeriods = [];
    if (specialPeriods?.rahu)       avoidPeriods.push({ label: lang === 'ta' ? 'ராகு காலம்' : 'Rahu Kalam',   ...specialPeriods.rahu,       cls: 'bg-rose-50 text-rose-700 border-rose-200' });
    if (specialPeriods?.yamagandam) avoidPeriods.push({ label: lang === 'ta' ? 'எமகண்டம்'   : 'Yamagandam',  ...specialPeriods.yamagandam, cls: 'bg-orange-50 text-orange-700 border-orange-200' });
    if (specialPeriods?.kulikai)    avoidPeriods.push({ label: lang === 'ta' ? 'குளிகன்'    : 'Kulikai',     ...specialPeriods.kulikai,    cls: 'bg-violet-50 text-violet-700 border-violet-200' });

    return { nallaSlots, avoidPeriods };
  }, [prediction, filters, lang]);

  const bird = birdId ? birdOptions.find(b => b.id === birdId) : null;

  return (
    <PortalShell title={lang === 'ta' ? 'நல்ல நேரம்' : 'Nalla Neram'} lang={lang} onToggleLang={() => setLang(l => l === 'ta' ? 'en' : 'ta')}>
      <div className="space-y-8">

        {/* Form */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-base font-black uppercase tracking-widest text-amber-700">
            {lang === 'ta' ? 'நல்லநேரம் தேர்வு' : 'Auspicious Time Finder'}
          </h2>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {lang === 'ta' ? 'தேதி' : 'Date'}
            </label>
            <input
              type="date" value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Bird */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {lang === 'ta' ? 'பட்சி தேர்வு' : 'Select Bird'}
            </label>
            <div className="flex flex-wrap gap-3">
              {birdOptions.map(b => {
                const Icon = BIRD_ICONS[b.key];
                const sel = birdId === b.id;
                return (
                  <button key={b.id} type="button" onClick={() => setBirdId(b.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-tight transition-all ${sel ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-200'}`}
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${sel ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                      {sel && <span className="text-white text-[10px] font-black">✓</span>}
                    </span>
                    {Icon && <Icon size={14} />}
                    {lang === 'ta' ? b.tamil : b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {lang === 'ta' ? 'வடிகட்டிகள்' : 'Filters'}
            </label>
            <div className="flex flex-wrap gap-3">
              {FILTER_OPTIONS.map(opt => (
                <button key={opt.key} type="button" onClick={() => toggleFilter(opt.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[11px] font-black uppercase tracking-tight transition-all ${filters[opt.key] ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-400'}`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${filters[opt.key] ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                    {filters[opt.key] && <span className="text-white text-[10px] font-black">✓</span>}
                  </span>
                  {lang === 'ta' ? opt.ta : opt.en}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs font-bold text-rose-500">{error}</p>}

          <button onClick={handleGenerate} disabled={loading}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
          >
            {loading ? (lang === 'ta' ? 'கணக்கிடப்படுகிறது...' : 'Calculating...') : (lang === 'ta' ? 'காண்க' : 'Generate')}
          </button>
        </div>

        {/* Results */}
        {prediction && (
          <div className="space-y-6">

            {/* Avoid periods */}
            {avoidPeriods.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 self-center">
                  {lang === 'ta' ? 'தவிர்க்கவும்:' : 'Avoid:'}
                </span>
                {avoidPeriods.map((p, i) => (
                  <span key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black ${p.cls}`}>
                    <span className="font-black">{p.label}</span>
                    <span className="font-bold opacity-70">{p.startLabel} – {p.endLabel}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Nalla Neram slots */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
                  {nallaSlots.length > 0
                    ? `${lang === 'ta' ? 'நல்ல நேரம்' : 'Nalla Neram'} — ${nallaSlots.length} ${lang === 'ta' ? 'நேரங்கள்' : 'slots'}`
                    : (lang === 'ta' ? 'நல்ல நேரம் இல்லை' : 'No auspicious slots found')}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>

              {nallaSlots.length === 0 && (
                <div className="glass-card p-8 text-center text-slate-400 text-sm font-bold">
                  {lang === 'ta'
                    ? 'தேர்ந்தெடுத்த வடிகட்டிகளுக்கு ஏற்ப நல்ல நேரம் இல்லை. வடிகட்டிகளை மாற்றி முயற்சிக்கவும்.'
                    : 'No auspicious slots match the selected filters. Try adjusting the filters.'}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {nallaSlots.map(({ sub, horaSlot, gowriSlot }, idx) => {
                  const actStyle = ACTIVITY_STYLE[sub.activity?.key] || { bg: 'bg-slate-100', text: 'text-slate-600' };
                  return (
                    <div key={idx} className="glass-card p-4 border-none ring-2 ring-emerald-200 bg-emerald-50/40 space-y-3">
                      {/* Time + period */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-black text-slate-800 tabular-nums">
                            {sub.startLabel} – {sub.endLabel}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {sub.period === 'day' ? (lang === 'ta' ? 'பகல்' : 'Day') : (lang === 'ta' ? 'இரவு' : 'Night')}
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-white bg-emerald-500 px-2 py-1 rounded-lg shadow-sm">
                          {lang === 'ta' ? '✓ நல்ல நேரம்' : '✓ Nalla Neram'}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {/* Pancha Pakshi activity */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase ${actStyle.bg} ${actStyle.text}`}>
                          {lang === 'ta' ? sub.bird?.tamil : sub.bird?.label}
                          {' · '}
                          {lang === 'ta' ? sub.activity?.tamil : sub.activity?.label}
                        </span>

                        {/* Horai */}
                        {horaSlot && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-700">
                            <span className={`w-1.5 h-1.5 rounded-full ${PLANET_COLOR[horaSlot.planet.key] || 'bg-slate-400'}`} />
                            {lang === 'ta' ? horaSlot.planet.tamil : horaSlot.planet.label}
                          </span>
                        )}

                        {/* Gowri */}
                        {gowriSlot && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${gowriSlot.type.nature === 'good' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${gowriSlot.type.nature === 'good' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {lang === 'ta' ? gowriSlot.type.tamil : gowriSlot.type.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
