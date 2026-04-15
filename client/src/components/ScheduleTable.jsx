import React, { useState } from 'react';

const L = {
  en: {
    yama: 'Yama', subBird: 'Sub Bird', subActivity: 'Activity',
    subTime: 'Sub Time', relation: 'Relation', palan: 'Palan',
    paduBird: 'Padu Bird', rulingBird: 'Ruling Bird',
    dayTable: 'Day Schedule', nightTable: 'Night Schedule',
    strength: 'Strength',
  },
  ta: {
    yama: 'யாமம்', subBird: 'அந்தர பட்சி', subActivity: 'தொழில்',
    subTime: 'அந்தர பட்சி நேரம்', relation: 'உறவு', palan: 'பலன்',
    paduBird: 'படுபட்சி', rulingBird: 'அதிகார பட்சி',
    dayTable: 'பகல் அட்டவணை', nightTable: 'இரவு அட்டவணை',
    strength: 'பலம்',
  },
};

function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

const SOOKSHIMA_PAIRS = [
  { birdId: 1, activity: 'eating', duration: 13 },
  { birdId: 2, activity: 'walking', duration: 12 },
  { birdId: 3, activity: 'sleeping', duration: 9 },
  { birdId: 4, activity: 'dying', duration: 15 },
  { birdId: 5, activity: 'ruling', duration: 11 },
];

function getSookshimaDetails(birdId, activity, startTime, endTime, lang) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const totalDuration = end - start;
  const slotCount = 5;
  const slotDuration = totalDuration / slotCount;

  return Array.from({ length: slotCount }).map((_, i) => {
    const s = start + (i * slotDuration);
    const e = s + slotDuration;
    const sLabel = new Date(s).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const eLabel = new Date(e).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return {
      index: i + 1,
      timeLabel: `${sLabel} - ${eLabel}`,
    };
  });
}

export function ScheduleTable({ tone, yamas, lang }) {
  const c = L[lang];
  const [expandSubs, setExpandSubs] = useState('');

  return (
    <section className="glass-card overflow-hidden p-0 border-none shadow-premium animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`px-8 py-5 flex items-center justify-between border-b ${
        tone === 'day' ? 'bg-amber-400/10 border-amber-100/50' : 'bg-indigo-400/10 border-indigo-100/50'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${tone === 'day' ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]'}`} />
          <h2 className={`text-xl font-black uppercase tracking-tight ${tone === 'day' ? 'text-amber-700' : 'text-indigo-700'}`}>
            {tone === 'day' ? c.dayTable : c.nightTable}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className={`text-[10px] font-black uppercase tracking-widest ${tone === 'day' ? 'text-yellow-600/60' : 'text-blue-600/60'}`}>
              <th className="px-6 py-4 border-b border-white/50">{c.yama}</th>
              <th className="px-6 py-4 border-b border-white/50">{c.subBird}</th>
              <th className="px-6 py-4 border-b border-white/50">{c.subActivity}</th>
              <th className="px-6 py-4 border-b border-white/50">{c.subTime}</th>
              <th className="px-6 py-4 border-b border-white/50">{lang === 'ta' ? 'திசை' : 'Direction'}</th>
              <th className="px-6 py-4 border-b border-white/50">{c.palan}</th>
              <th className="px-6 py-4 border-b border-white/50">{c.strength}</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {yamas.map((yama) => (
              <tr key={yama.index} className="group border-b border-white/30 last:border-none">
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-800 tabular-nums leading-none mb-1">#{yama.index}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{yama.startLabel}</span>
                  </div>
                </td>
                <td colSpan="6" className="p-0">
                    <table className="w-full">
                      <tbody className="text-xs">
                        {yama.children.map((s, i) => {
                          const isExp = expandSubs === `${yama.index}-${i}`;
                          return (
                            <tr key={i} className="group hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 w-1/8 border-b border-white/10 group-last:border-none font-bold text-slate-900">
                                {n(s.bird, lang)}
                              </td>
                              <td className="px-6 py-4 border-b border-white/10 group-last:border-none">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  s.activity?.key === 'ruling' ? 'bg-amber-100 text-amber-700' :
                                  s.activity?.key === 'eating' ? 'bg-emerald-100 text-emerald-700' :
                                  s.activity?.key === 'walking' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                   {n(s.activity, lang)}
                                </div>
                              </td>
                              <td className="px-6 py-4 border-b border-white/10 group-last:border-none">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-600 tabular-nums">{s.startLabel} - {s.endLabel}</span>
                                  <button 
                                    onClick={() => setExpandSubs(isExp ? '' : `${yama.index}-${i}`)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-400"
                                  >
                                    {isExp ? '−' : '+'}
                                  </button>
                                </div>
                                {isExp && getSookshimaDetails(s.bird?.id, s.activity?.key, s.start, s.end, lang).map((sk, j) => (
                                  <div key={j} className="text-[10px] font-bold text-slate-400 py-1 mt-1 tabular-nums">
                                    {sk.timeLabel}
                                  </div>
                                ))}
                              </td>
                              <td className="px-6 py-4 w-1/4 border-b border-white/10 group-last:border-none">
                                <div className="text-xs font-bold text-indigo-600">
                                   {lang === 'ta' ? yama.parent.direction?.tamil : yama.parent.direction?.label}
                                </div>
                                {isExp && <div className="h-[92px]" />}
                              </td>
                              <td className="px-6 py-4 border-b border-white/10 group-last:border-none">
                                <div className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                                  {s.palan || <span className="opacity-30">—</span>}
                                </div>
                                {isExp && <div className="h-[92px]" />}
                              </td>
                              <td className="px-6 py-4 w-1/8 font-bold border-b border-white/10 group-last:border-none">
                                <div className={`px-2 py-1 rounded text-[10px] text-center ${
                                  Number(s.strength) >= 75 ? 'bg-emerald-100 text-emerald-700' :
                                  Number(s.strength) >= 50 ? 'bg-blue-100 text-blue-700' :
                                  Number(s.strength) >= 25 ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {s.strength}%
                                </div>
                                {isExp && <div className="h-[92px]" />}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
