import React from 'react';

const NATURE_COLORS = {
  good: 'bg-emerald-500 shadow-emerald-200',
  bad: 'bg-rose-500 shadow-rose-200',
};

export function GowriTable({ gowri, lang }) {
  if (!gowri || gowri.length === 0) return null;

  const daySlots = gowri.filter(h => h.period === 'day');
  const nightSlots = gowri.filter(h => h.period === 'night');

  const Section = ({ title, slots, isDay }) => (
    <div className={`glass-card overflow-hidden p-0 border-none shadow-card ${isDay ? 'bg-amber-50/30' : 'bg-slate-50/30'}`}>
      <div className={`px-6 py-4 border-b flex items-center justify-between ${isDay ? 'bg-amber-400/10 border-amber-100' : 'bg-slate-400/10 border-slate-200'}`}>
        <h3 className={`text-lg font-black uppercase tracking-tight ${isDay ? 'text-amber-700' : 'text-slate-700'}`}>{title}</h3>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">12 Sections</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-200/50">
        {slots.map((slot) => (
          <div key={slot.index} className="bg-white/60 backdrop-blur-sm p-4 hover:bg-white/80 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${NATURE_COLORS[slot.type.nature]} flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                <span className="text-xs font-black">{slot.index}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-base font-black leading-none mb-1 ${slot.type.nature === 'good' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {lang === 'ta' ? slot.type.tamil : slot.type.label}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{slot.startLabel}</span>
                  <span className="opacity-30">—</span>
                  <span>{slot.endLabel}</span>
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
          {lang === 'ta' ? 'கௌரி பஞ்சாங்கம்' : 'Gowri Panchangam'}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      </div>

      <div className="space-y-12">
        <Section title={lang === 'ta' ? 'பகல் கௌரி' : 'Day Gowri'} slots={daySlots} isDay={true} />
        <Section title={lang === 'ta' ? 'இரவு கௌரி' : 'Night Gowri'} slots={nightSlots} isDay={false} />
      </div>
    </div>
  );
}
