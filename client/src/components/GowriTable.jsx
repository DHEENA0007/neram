import React from 'react';

const NATURE_STYLE = {
  good: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  bad:  { dot: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50'    },
};

function GowriCard({ slot, lang }) {
  const style = NATURE_STYLE[slot.type.nature] || NATURE_STYLE.bad;
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/70 hover:bg-white transition-colors duration-150">
      <div className={`w-8 h-8 rounded-xl ${style.dot} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
        {slot.index}
      </div>
      <div className="min-w-0">
        <div className={`text-[12px] font-black truncate ${style.text}`}>
          {lang === 'ta' ? slot.type.tamil : slot.type.label}
        </div>
        <div className="text-[9px] font-bold text-slate-400 tabular-nums whitespace-nowrap">
          {slot.startLabel} – {slot.endLabel}
        </div>
      </div>
    </div>
  );
}

export function GowriTable({ gowri, lang }) {
  if (!gowri || gowri.length === 0) return null;

  const daySlots   = gowri.filter(g => g.period === 'day');
  const nightSlots = gowri.filter(g => g.period === 'night');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
          {lang === 'ta' ? 'கௌரி பஞ்சாங்கம்' : 'Gowri Panchangam'}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* Day + Night side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day */}
        <div className="glass-card overflow-hidden p-0 border-none bg-amber-50/20">
          <div className="px-5 py-3 border-b border-amber-100 bg-amber-400/10 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-tight text-amber-700">
              {lang === 'ta' ? 'பகல் கௌரி' : 'Day Gowri'}
            </h3>
            <span className="text-[9px] font-bold text-amber-600/60 uppercase tracking-widest">8 Sections</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-amber-100/30">
            {daySlots.map(s => <GowriCard key={s.index} slot={s} lang={lang} />)}
          </div>
        </div>

        {/* Night */}
        <div className="glass-card overflow-hidden p-0 border-none bg-slate-50/30">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-400/10 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-600">
              {lang === 'ta' ? 'இரவு கௌரி' : 'Night Gowri'}
            </h3>
            <span className="text-[9px] font-bold text-slate-500/60 uppercase tracking-widest">8 Sections</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-slate-100/40">
            {nightSlots.map(s => <GowriCard key={s.index} slot={s} lang={lang} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
