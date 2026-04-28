import React, { useState, useMemo } from 'react';
import { birdOptions } from '../../shared/constants.js';
import { requestPrediction } from '../../api.js';
import { PortalShell } from '../../components/PortalShell.jsx';
import { useAuth } from '../../auth.jsx';
import { IconVulture, IconOwl, IconCrow, IconHen, IconPeacock, IconDownload, IconLock, IconClock, IconX } from '../../components/Icons.jsx';
import { NallaNeramPrintView } from '../../components/NallaNeramPrintView.jsx';
import { loadBrandingConfig } from '../../api.js';

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
  const { user, requestDownloadAccess, recordDownload } = useAuth();
  const [lang, setLang] = useState('ta');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [birdId, setBirdId] = useState(null);
  const [filters, setFilters] = useState({ horai: true, gowri: true, rahu: true, yama: true });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branding, setBranding] = useState(null);

  React.useEffect(() => {
    loadBrandingConfig().then(setBranding).catch(console.error);
  }, []);

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

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requesting, setRequesting] = useState(false);

  async function handleRequestAccess() {
    setRequesting(true);
    try {
      await requestDownloadAccess('nalaneram');
      setShowRequestModal(false);
      alert(lang === 'ta' ? 'விண்ணப்பம் அனுப்பப்பட்டது!' : 'Request sent successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setRequesting(false);
    }
  }

  async function handlePrintAction() {
    const isAdmin = user?.role === 'admin';
    const dp = user?.downloadPermissions?.nalaneram || { allowed: false, requestStatus: 'none' };
    if (isAdmin || dp.allowed) {
      handlePrint();
    } else {
      setShowRequestModal(true);
    }
  }

  async function handlePrint() {
    const printEl = document.getElementById('nalla-neram-print-view');
    if (!printEl) return;
    
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
          <title>${lang === 'ta' ? 'நல்ல நேரம்' : 'Nalla Neram Report'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=Noto+Sans+Tamil:wght@400;700;800;900&display=swap" rel="stylesheet">
          <style>
            html, body { margin: 0; padding: 0; overflow: visible !important; }
            @media print {
              @page { margin: 0; size: A4; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          <div style="width: 100%; display: block;">${printEl.innerHTML}</div>
          <script>
            window.onload = () => {
              document.fonts.ready.then(() => {
                window.print();
                setTimeout(() => { window.frameElement.remove(); }, 1000);
              });
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
    try { await recordDownload('nalaneram'); } catch (e) { console.error(e); }
  }

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
              
              <div className="flex justify-end">
                <button
                  onClick={handlePrintAction}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all ${
                    (user?.role === 'admin' || user?.downloadPermissions?.nalaneram?.allowed)
                      ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/20'
                      : 'bg-white border border-slate-200 text-slate-400 hover:border-amber-500 hover:text-amber-500 shadow-slate-200/50'
                  }`}
                >
                   {(user?.role === 'admin' || user?.downloadPermissions?.nalaneram?.allowed) ? <IconDownload size={18} /> : <IconLock size={18} />}
                   {lang === 'ta' ? 'PDF பதிவிறக்கம்' : 'Download PDF'}
                   {!(user?.role === 'admin' || user?.downloadPermissions?.nalaneram?.allowed) && (
                     <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded-[4px] text-[8px]">LOCKED</span>
                   )}
                </button>
              </div>

              <NallaNeramPrintView 
                nallaSlots={nallaSlots} 
                avoidPeriods={avoidPeriods} 
                lang={lang} 
                date={date} 
                branding={branding} 
              />

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
                 ? 'இந்த அறிக்கையை பதிவிறக்கம் செய்ய உங்களுக்கு அனுமதி இல்லை. பதிவிறக்க வசதியை பெற நிர்வாகியிடம் அனுமதி கோரவும்.' 
                 : 'You do not have permission to download this report. Please send a request to the administrator to enable this feature for your account.'}
             </p>

             <div className="space-y-3">
               {user?.downloadPermissions?.nalaneram?.requestStatus === 'pending' ? (
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
    </PortalShell>
  );
}
