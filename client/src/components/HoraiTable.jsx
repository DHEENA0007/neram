import React from 'react';
import { IconSun, IconBird } from './Icons.jsx';

const PLANET_COLORS = {
  sun: 'from-orange-400 to-red-500 shadow-orange-200',
  moon: 'from-slate-200 to-slate-400 shadow-slate-100',
  mars: 'from-red-500 to-red-700 shadow-red-200',
  mercury: 'from-emerald-300 to-teal-500 shadow-emerald-100',
  jupiter: 'from-yellow-300 to-amber-500 shadow-yellow-100',
  venus: 'from-pink-300 to-rose-500 shadow-pink-100',
  saturn: 'from-slate-600 to-slate-800 shadow-slate-300',
};

export function HoraiTable({ horai, lang }) {
  if (!horai || horai.length === 0) return null;

  const dayHoras = horai.filter(h => h.period === 'day');
  const nightHoras = horai.filter(h => h.period === 'night');

  const Section = ({ title, horas, isDay }) => (
    <div className={`glass-card overflow-hidden p-0 border-none shadow-card ${isDay ? 'bg-yellow-50/30' : 'bg-indigo-50/30'}`}>
      <div className={`px-6 py-4 border-b flex items-center justify-between ${isDay ? 'bg-yellow-400/10 border-yellow-100' : 'bg-indigo-400/10 border-indigo-100'}`}>
        <h3 className={`text-lg font-black uppercase tracking-tight ${isDay ? 'text-yellow-700' : 'text-indigo-700'}`}>{title}</h3>
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-60`}>12 Horas</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-200/50">
        {horas.map((hora) => (
          <div key={hora.index} className="bg-white/60 backdrop-blur-sm p-4 hover:bg-white/80 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${PLANET_COLORS[hora.planet.key]} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {hora.planet.key === 'sun' ? <IconSun size={20} /> : <span className="text-sm font-black">{hora.index}</span>}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-800 leading-none mb-1">
                  {lang === 'ta' ? hora.planet.tamil : hora.planet.label}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{hora.startLabel}</span>
                  <span className="opacity-30">—</span>
                  <span>{hora.endLabel}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-4 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
          {lang === 'ta' ? 'ஹோரை கால அட்டவணை' : 'Horai Schedule'}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      </div>

      <div className="space-y-12">
        <Section title={lang === 'ta' ? 'பகல் ஹோரை' : 'Day Horai'} horas={dayHoras} isDay={true} />
        <Section title={lang === 'ta' ? 'இரவு ஹோரை' : 'Night Horai'} horas={nightHoras} isDay={false} />
      </div>
    </div>
  );
}
