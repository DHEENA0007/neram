import React, { useState, useMemo } from 'react';

const L = {
  en: {
    yama: 'Yama', bird: 'Bird', activity: 'Activity',
    time: 'Time', direction: 'Direction', palan: 'Palan',
    strength: 'Strength',
    dayTable: 'Day Schedule', nightTable: 'Night Schedule',
    sookshima: 'Sookshima Breakdown',
  },
  ta: {
    yama: 'யாமம்', bird: 'பட்சி', activity: 'தொழில்',
    time: 'நேரம்', direction: 'திசை', palan: 'பலன்',
    strength: 'பலம்',
    dayTable: 'பகல் அட்டவணை', nightTable: 'இரவு அட்டவணை',
    sookshima: 'சூட்சும விவரம்',
  },
};

function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

function getSookshimaSlots(subRows, currentIndex, parentStart, parentEnd) {
  const start = new Date(parentStart).getTime();
  const end = new Date(parentEnd).getTime();
  const slotDuration = (end - start) / 5;
  const rotated = [...subRows.slice(currentIndex), ...subRows.slice(0, currentIndex)];
  return rotated.map((row, i) => {
    const s = start + i * slotDuration;
    const e = s + slotDuration;
    return {
      bird: row.bird,
      activity: row.activity,
      startLabel: new Date(s).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      endLabel: new Date(e).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  });
}

const ACTIVITY_STYLE = {
  ruling:   'bg-amber-100   text-amber-700',
  eating:   'bg-emerald-100 text-emerald-700',
  walking:  'bg-blue-100    text-blue-700',
  sleeping: 'bg-violet-100  text-violet-700',
  dying:    'bg-rose-100    text-rose-600',
};

function ActivityBadge({ activity, lang }) {
  const cls = ACTIVITY_STYLE[activity?.key] || 'bg-slate-100 text-slate-500';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${cls}`}>
      {n(activity, lang)}
    </span>
  );
}

function StrengthBadge({ strength }) {
  const v = Number(strength);
  const cls =
    v >= 75 ? 'bg-emerald-100 text-emerald-700' :
    v >= 50 ? 'bg-blue-100    text-blue-700'    :
    v >= 25 ? 'bg-orange-100  text-orange-700'  :
              'bg-rose-100    text-rose-700';
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black tabular-nums ${cls}`}>
      {strength}%
    </span>
  );
}

function overlaps(rowStart, rowEnd, periodStart, periodEnd) {
  return rowStart < periodEnd && rowEnd > periodStart;
}

function getSpecialWarnings(start, end, specialPeriods) {
  if (!specialPeriods) return [];
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const warnings = [];
  if (specialPeriods.rahu && overlaps(s, e, new Date(specialPeriods.rahu.start).getTime(), new Date(specialPeriods.rahu.end).getTime()))
    warnings.push('rahu');
  if (specialPeriods.yamagandam && overlaps(s, e, new Date(specialPeriods.yamagandam.start).getTime(), new Date(specialPeriods.yamagandam.end).getTime()))
    warnings.push('yama');
  if (specialPeriods.kulikai && overlaps(s, e, new Date(specialPeriods.kulikai.start).getTime(), new Date(specialPeriods.kulikai.end).getTime()))
    warnings.push('kuli');
  return warnings;
}

const SPECIAL_BADGE = {
  rahu: { en: 'Rahu', ta: 'ராகு', cls: 'bg-rose-100 text-rose-600' },
  yama: { en: 'Yama', ta: 'எமகண்டம்', cls: 'bg-orange-100 text-orange-600' },
  kuli: { en: 'Gulikai', ta: 'குளிகன்', cls: 'bg-violet-100 text-violet-600' },
};

export function ScheduleTable({ tone, yamas, lang, specialPeriods }) {
  const c = L[lang];
  const [expandSubs, setExpandSubs] = useState('');

  const isDay = tone === 'day';
  const accentBg  = isDay ? 'bg-amber-400/10 border-amber-100/50'   : 'bg-indigo-400/10 border-indigo-100/50';
  const accentDot = isDay ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.5)]';
  const accentTxt = isDay ? 'text-amber-700' : 'text-indigo-700';
  const thTxt     = isDay ? 'text-amber-600/50' : 'text-indigo-600/50';

  return (
    <section className="glass-card overflow-hidden p-0 border-none shadow-premium animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className={`px-6 md:px-8 py-5 flex items-center gap-4 border-b ${accentBg}`}>
        <div className={`w-3 h-3 rounded-full shrink-0 ${accentDot}`} />
        <h2 className={`text-lg md:text-xl font-black uppercase tracking-tight ${accentTxt}`}>
          {isDay ? c.dayTable : c.nightTable}
        </h2>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '90px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '110px' }} />
            <col />
            <col style={{ width: '80px' }} />
          </colgroup>

          <thead>
            <tr className={`text-[10px] font-black uppercase tracking-widest bg-slate-50/60 border-b border-slate-100 ${thTxt}`}>
              <th className="px-5 py-4">{c.yama}</th>
              <th className="px-5 py-4">{c.bird}</th>
              <th className="px-5 py-4">{c.activity}</th>
              <th className="px-5 py-4">{c.time}</th>
              <th className="px-5 py-4">{c.direction}</th>
              <th className="px-5 py-4">{c.palan}</th>
              <th className="px-5 py-4 text-right">{c.strength}</th>
            </tr>
          </thead>

          {yamas.map((yama) => (
            <tbody key={yama.index} className="border-b-2 border-slate-100 last:border-none">
              {yama.subRows.map((s, i) => {
                const key = `${yama.index}-${i}`;
                const isExp = expandSubs === key;
                const warnings = getSpecialWarnings(s.start, s.end, specialPeriods);
                return (
                  <React.Fragment key={key}>
                    <tr className="hover:bg-slate-50/60 transition-colors duration-150">
                      <td className="px-5 py-4 align-top">
                        {i === 0 && (
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-base font-black tabular-nums ${accentTxt}`}>#{yama.index}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide tabular-nums">{yama.startLabel}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 text-sm">{n(s.bird, lang)}</td>
                      <td className="px-5 py-4"><ActivityBadge activity={s.activity} lang={lang} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">{s.startLabel} – {s.endLabel}</span>
                          {warnings.map(w => (
                            <span key={w} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${SPECIAL_BADGE[w].cls}`}>
                              {SPECIAL_BADGE[w][lang]}
                            </span>
                          ))}
                          <button
                            onClick={() => setExpandSubs(isExp ? '' : key)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black transition-all shrink-0 ${isExp ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                          >
                            {isExp ? '−' : '+'}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {s.direction && (
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{n(s.direction, lang)}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 leading-relaxed">{s.palan || <span className="text-slate-300">—</span>}</td>
                      <td className="px-5 py-4 text-right"><StrengthBadge strength={s.strength} /></td>
                    </tr>
                    {isExp && (
                      <tr className="bg-amber-50/40">
                        <td colSpan={7} className="px-5 py-0">
                          <div className="border-l-2 border-amber-300 ml-8 my-3 pl-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2">{c.sookshima}</p>
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                  <th className="py-1 pr-4 text-left font-black" style={{ width: '120px' }}>{c.bird}</th>
                                  <th className="py-1 pr-4 text-left font-black" style={{ width: '110px' }}>{c.activity}</th>
                                  <th className="py-1 text-left font-black">{c.time}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getSookshimaSlots(yama.subRows, i, s.start, s.end).map((sk, j) => (
                                  <tr key={j} className="border-t border-amber-100/60">
                                    <td className="py-2 pr-4 font-bold text-slate-800 text-xs">{n(sk.bird, lang)}</td>
                                    <td className="py-2 pr-4"><ActivityBadge activity={sk.activity} lang={lang} /></td>
                                    <td className="py-2 text-xs font-bold text-slate-500 tabular-nums whitespace-nowrap">{sk.startLabel} – {sk.endLabel}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="lg:hidden divide-y divide-slate-100">
        {yamas.map((yama) => (
          <div key={yama.index} className="space-y-px bg-slate-50/30">
            {/* Yama Header */}
            <div className="px-6 py-3 bg-white border-b border-slate-100 flex justify-between items-center">
               <div className="flex flex-col">
                  <span className={`text-lg font-black ${accentTxt}`}>#{yama.index}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{yama.startLabel} – {yama.endLabel}</span>
               </div>
               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tight">
                 {n(yama.direction, lang)}
               </span>
            </div>

            {/* Sub-rows as Cards */}
            <div className="divide-y divide-slate-100">
               {yama.subRows.map((s, i) => {
                 const key = `mob-${yama.index}-${i}`;
                 const isExp = expandSubs === key;
                 const mobWarnings = getSpecialWarnings(s.start, s.end, specialPeriods);
                 return (
                   <div key={key} className="p-4 bg-white/60">
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-black text-slate-800">{n(s.bird, lang)}</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400 tabular-nums">{s.startLabel} – {s.endLabel}</span>
                              {mobWarnings.map(w => (
                                <span key={w} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${SPECIAL_BADGE[w].cls}`}>
                                  {SPECIAL_BADGE[w][lang]}
                                </span>
                              ))}
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <StrengthBadge strength={s.strength} />
                            <button
                               onClick={() => setExpandSubs(isExp ? '' : key)}
                               className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-all ${isExp ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-500'}`}
                            >
                               {isExp ? '−' : '+'}
                            </button>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                         <ActivityBadge activity={s.activity} lang={lang} />
                         {s.direction && (
                           <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{n(s.direction, lang)}</span>
                         )}
                      </div>
                      <p className="text-xs text-slate-500 leading-normal italic px-1">
                        {s.palan || '—'}
                      </p>

                      {/* Mobile Sookshima */}
                      {isExp && (
                        <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 animate-in slide-in-from-top-2">
                           <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-3">{c.sookshima}</p>
                           <div className="space-y-4">
                              {getSookshimaSlots(yama.subRows, i, s.start, s.end).map((sk, j) => (
                                <div key={j} className="flex justify-between items-start">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-black text-slate-800">{n(sk.bird, lang)}</span>
                                      <span className="text-[10px] font-bold text-slate-400 tabular-nums">{sk.startLabel} – {sk.endLabel}</span>
                                   </div>
                                   <ActivityBadge activity={sk.activity} lang={lang} />
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
