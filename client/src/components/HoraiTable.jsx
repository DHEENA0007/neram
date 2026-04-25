import React from 'react';
import { IconSun } from './Icons.jsx';

const PLANET_COLORS = {
  sun:     'bg-orange-400',
  moon:    'bg-slate-400',
  mars:    'bg-red-500',
  mercury: 'bg-teal-500',
  jupiter: 'bg-amber-400',
  venus:   'bg-pink-400',
  saturn:  'bg-slate-700',
};

function HoraCard({ hora, lang, isCurrent }) {
  const color = PLANET_COLORS[hora.planet.key] || 'bg-slate-400';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 bg-white/70 hover:bg-white transition-colors duration-150 ${isCurrent ? 'ring-2 ring-amber-500 ring-inset bg-amber-50/50' : ''}`}>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white text-xs font-black shrink-0 ${isCurrent ? 'animate-pulse' : ''}`}>
        {hora.index}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black text-slate-800 truncate flex items-center gap-1.5">
          {lang === 'ta' ? hora.planet.tamil : hora.planet.label}
          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
        </div>
        <div className="text-[11px] font-bold text-slate-400 tabular-nums whitespace-nowrap">
          {hora.startLabel} – {hora.endLabel}
        </div>
      </div>
    </div>
  );
}

export function HoraiTable({ horai, lang }) {
  if (!horai || horai.length === 0) return null;

  const nowMs = Date.now();

  const dayHoras   = horai.filter(h => h.period === 'day');
  const nightHoras = horai.filter(h => h.period === 'night');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <h2 className="text-base font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
          {lang === 'ta' ? 'ஹோரை கால அட்டவணை' : 'Horai Schedule'}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Day + Night side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day */}
        <div className="glass-card overflow-hidden p-0 border-none bg-amber-50/30">
          <div className="px-5 py-3 border-b border-amber-100 bg-amber-400/10 flex items-center justify-between">
            <h3 className="text-base font-black uppercase tracking-tight text-amber-700">
              {lang === 'ta' ? 'பகல் ஹோரை' : 'Day Horai'}
            </h3>
            <span className="text-[11px] font-bold text-amber-600/60 uppercase tracking-widest">12 Horas</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-amber-100/40">
            {dayHoras.map(h => (
              <HoraCard 
                key={h.index} 
                hora={h} 
                lang={lang} 
                isCurrent={nowMs >= new Date(h.start).getTime() && nowMs < new Date(h.end).getTime()} 
              />
            ))}
          </div>
        </div>

        {/* Night */}
        <div className="glass-card overflow-hidden p-0 border-none bg-indigo-50/30">
          <div className="px-5 py-3 border-b border-indigo-100 bg-indigo-400/10 flex items-center justify-between">
            <h3 className="text-base font-black uppercase tracking-tight text-indigo-700">
              {lang === 'ta' ? 'இரவு ஹோரை' : 'Night Horai'}
            </h3>
            <span className="text-[11px] font-bold text-indigo-600/60 uppercase tracking-widest">12 Horas</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-indigo-100/40">
            {nightHoras.map(h => (
              <HoraCard 
                key={h.index} 
                hora={h} 
                lang={lang} 
                isCurrent={nowMs >= new Date(h.start).getTime() && nowMs < new Date(h.end).getTime()} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
