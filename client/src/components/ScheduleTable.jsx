import { useState } from 'react';
import { DateTime } from 'luxon';
import { birdOptions, activityOptions } from '../shared/constants.js';

const COL = {
  en: {
    yama: 'Yama', subBird: 'Sub Bird', subActivity: 'Sub Bird Activity',
    subTime: 'Sub Bird Time', relation: 'Relation', palan: 'Prediction',
    paduBird: 'Padu Bird', rulingBird: 'Ruling Bird',
    dayTable: 'Day Schedule', nightTable: 'Night Schedule',
  },
  ta: {
    yama: 'ஜாமம்', subBird: 'அந்தர பட்சி', subActivity: 'அந்தர பட்சி தொழில்',
    subTime: 'அந்தர பட்சி நேரம்', relation: 'உறவு', palan: 'பலன்',
    paduBird: 'படுபட்சி', rulingBird: 'அதிகார பட்சி',
    dayTable: 'பகல் அட்டவணை', nightTable: 'இரவு அட்டவணை',
  },
};

function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

const SOOKSHIMA_PAIRS = [
  { birdId: 1, activityKey: 'eating' },
  { birdId: 4, activityKey: 'dying' },
  { birdId: 2, activityKey: 'sleeping' },
  { birdId: 5, activityKey: 'ruling' },
  { birdId: 3, activityKey: 'walking' },
];

function getSookshimaDetails(parentBirdId, parentActivityKey, startISO, endISO, lang) {
  const startIndex = SOOKSHIMA_PAIRS.findIndex(
    p => p.birdId === parentBirdId && p.activityKey === parentActivityKey
  );
  
  const rotated = startIndex === -1 
    ? SOOKSHIMA_PAIRS 
    : [...SOOKSHIMA_PAIRS.slice(startIndex), ...SOOKSHIMA_PAIRS.slice(0, startIndex)];

  const start = DateTime.fromISO(startISO);
  const end = DateTime.fromISO(endISO);
  const totalDurationMs = end.diff(start).as('milliseconds');
  const stepMs = totalDurationMs / 5;

  return rotated.map((pair, i) => {
    const sTime = start.plus({ milliseconds: stepMs * i });
    const eTime = i === 4 ? end : start.plus({ milliseconds: stepMs * (i + 1) });
    
    const bird = birdOptions.find(b => b.id === pair.birdId);
    const activity = activityOptions.find(a => a.key === pair.activityKey);

    return {
      bird,
      activity,
      timeLabel: `${sTime.toFormat('h:mm a').toLowerCase()} to ${eTime.toFormat('h:mm a').toLowerCase()}`
    };
  });
}

export function ScheduleTable({ tone, yamas, lang = 'ta' }) {
  const [expanded, setExpanded] = useState({}); 
  const c = COL[lang];

  const toggleExpand = (yIdx, sIdx) => {
    setExpanded(prev => {
      const yamaExp = prev[yIdx] || {};
      return {
        ...prev,
        [yIdx]: { ...yamaExp, [sIdx]: !yamaExp[sIdx] }
      };
    });
  };

  const first = yamas[0];
  const title = tone === 'day' ? c.dayTable : c.nightTable;

  return (
    <section className={`glass-card overflow-hidden shadow-card border-none ${tone === 'day' ? 'bg-yellow-50/40' : 'bg-blue-50/40'}`}>
      <div className={`px-8 py-5 flex flex-wrap items-baseline justify-between gap-4 border-b ${tone === 'day' ? 'bg-yellow-400/10 border-yellow-200' : 'bg-blue-400/10 border-blue-200'}`}>
        <h2 className={`text-2xl font-black ${tone === 'day' ? 'text-yellow-700' : 'text-blue-700'}`}>{title}</h2>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider opacity-60">
           <span>{c.paduBird}: <strong className="text-red-600">{n(first?.paduBird, lang)}</strong></span>
           <span>{c.rulingBird}: <strong className="text-green-700">{n(first?.bharanaBird, lang)}</strong></span>
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
              <th className="px-6 py-4 border-b border-white/50">{c.relation}</th>
              <th className="px-6 py-4 border-b border-white/50">{c.palan}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {yamas.map((yama) => (
              <tr key={yama.index} className="group border-b border-white/30 last:border-none">
                <td className="px-6 py-6 align-top">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">{lang === 'ta' ? 'ஜாமம்' : 'Yama'} {yama.index}</span>
                    <span className="text-xs font-bold text-slate-400 lowercase whitespace-nowrap">{yama.startLabel} – {yama.endLabel}</span>
                    <span className="text-[10px] font-black uppercase text-yellow-600 mt-2">{lang === 'ta' ? yama.mainActivity?.tamil : yama.mainActivity?.label}</span>
                  </div>
                </td>
                
                <td colSpan={5} className="p-0 align-top">
                   <table className="w-full">
                     <tbody>
                       {yama.subRows.map((s, i) => {
                         const isExp = expanded[yama.index]?.[s.index];
                         return (
                           <tr key={i} className="border-b border-white/20 last:border-none">
                             <td className="px-6 py-4 w-1/5">
                               <div className="font-bold text-slate-700">{lang === 'ta' ? s.bird?.tamil : s.bird?.label}</div>
                               {isExp && getSookshimaDetails(s.bird?.id, s.activity?.key, s.start, s.end, lang).map((sk, j) => (
                                 <div key={j} className="text-xs font-medium text-slate-400 pl-4 py-1 border-l-2 border-yellow-200 mt-1">
                                   {lang === 'ta' ? sk.bird?.tamil : sk.bird?.label}
                                 </div>
                               ))}
                             </td>
                             <td className="px-6 py-4 w-1/5">
                               <div className={`font-bold ${
                                 s.activity?.key === 'ruling' ? 'text-blue-600' : 
                                 s.activity?.key === 'eating' ? 'text-orange-600' :
                                 s.activity?.key === 'walking' ? 'text-green-600' :
                                 s.activity?.key === 'sleeping' ? 'text-purple-600' : 'text-red-600'
                               }`}>
                                 {lang === 'ta' ? s.activity?.tamil : s.activity?.label}
                               </div>
                               {isExp && getSookshimaDetails(s.bird?.id, s.activity?.key, s.start, s.end, lang).map((sk, j) => (
                                 <div key={j} className="text-[10px] font-black uppercase opacity-40 py-1 mt-1">
                                   {lang === 'ta' ? sk.activity?.tamil : sk.activity?.label}
                                 </div>
                               ))}
                             </td>
                             <td className="px-6 py-4 w-1/4">
                               <div className="flex items-center justify-between gap-4">
                                 <span className="text-xs font-bold text-slate-500">{s.startLabel} – {s.endLabel}</span>
                                 <button 
                                   className={`w-6 h-6 rounded-lg flex items-center justify-center text-lg transition-colors ${isExp ? 'bg-yellow-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-yellow-200'}`}
                                   onClick={() => toggleExpand(yama.index, s.index)}
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
                             <td className="px-6 py-4 w-1/8">
                               <div className={`font-bold ${
                                 s.relation?.key === 'friend' ? 'text-green-600' : 
                                 s.relation?.key === 'enemy' ? 'text-red-600' : 'text-orange-600'
                               }`}>
                                 {lang === 'ta' ? s.relation?.tamil : s.relation?.label}
                               </div>
                               {isExp && <div className="h-[92px]" />}
                             </td>
                             <td className="px-6 py-4">
                               <div className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                                 {s.palan || <span className="opacity-30">—</span>}
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
