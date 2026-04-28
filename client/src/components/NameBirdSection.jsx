import { useState, useEffect, useRef } from 'react';
import { birdOptions } from '../shared/constants.js';
import { nameBird } from '../api.js';
import { IconArrowRight, IconVulture, IconOwl, IconCrow, IconHen, IconPeacock } from './Icons.jsx';

const BIRD_ICONS = {
  vulture: IconVulture,
  owl: IconOwl,
  crow: IconCrow,
  cock: IconHen,
  peacock: IconPeacock
};

function useBirdFromName(name) {
  const [bird, setBird] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setBird(null);
    if (!name || !name.trim()) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await nameBird(name.trim());
        setBird(res.bird ?? null);
      } catch {
        setBird(null);
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [name]);

  return bird;
}

export function NameBirdSection({ onUpdateBird, lang }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  const bird1 = useBirdFromName(name1);
  const bird2 = useBirdFromName(name2);

  const t = {
    en: {
      title: 'Peyar Pakshi',
      label1: 'Your name (Horoscope holder)',
      label2: 'Person / Object / Place name to check',
      yourBird: 'Your Bird',
      otherBird: 'Their Bird',
      sync: 'Use as my bird',
    },
    ta: {
      title: 'பெயர் பட்சி',
      label1: 'ஜாதகரின் பெயர் — உங்கள் பெயர்',
      label2: 'பட்சி பார்க்க விரும்பும் நபர் / பொருள் / இடம் பெயர்',
      yourBird: 'உங்கள் பட்சி',
      otherBird: 'எதிராளி பட்சி',
      sync: 'என் பட்சியாக மாற்று',
    }
  }[lang];

  return (
    <div className="glass-card p-4 sm:p-6 border-none ring-1 ring-slate-100/80 bg-white/80 space-y-4 sm:space-y-5">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-700">{t.title}</h3>
      </div>

      {/* Row 1 — Your name */}
      <div className="space-y-2">
        <label className="text-[10px] sm:text-[12px] font-black text-slate-700 uppercase tracking-widest ml-1 block">
          {t.label1}
        </label>
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <input
              className="w-full px-4 py-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder={lang === 'ta' ? 'பெயர் உள்ளிடுக…' : 'Enter name…'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▽</span>
          </div>

          {bird1 ? (
            <div className="flex items-center justify-between gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{t.yourBird}</span>
              <div className="flex items-center gap-2">
                 <BirdChip bird={bird1} lang={lang} color="amber" />
                 <button
                   onClick={() => onUpdateBird(bird1.id)}
                   title={t.sync}
                   className="w-9 h-9 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-all shadow-sm"
                 >
                   <IconArrowRight size={14} className="-rotate-90" />
                 </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 whitespace-nowrap">{t.yourBird} —</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Row 2 — Other name */}
      <div className="space-y-2">
        <label className="text-[10px] sm:text-[12px] font-black text-slate-700 uppercase tracking-widest ml-1 block">
          {t.label2}
        </label>
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <input
              className="w-full px-4 py-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder={lang === 'ta' ? 'பெயர் உள்ளிடுக…' : 'Enter name…'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▽</span>
          </div>

          {bird2 ? (
            <div className="flex items-center justify-between gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{t.otherBird}</span>
              <BirdChip bird={bird2} lang={lang} color="indigo" />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 whitespace-nowrap">{t.otherBird} —</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BirdChip({ bird, lang, color }) {
  const Icon = BIRD_ICONS[bird.key];
  const styles = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${styles[color] || styles.amber}`}>
      <Icon size={14} />
      <span className="text-[11px] font-black tracking-tight">{lang === 'ta' ? bird.tamil : bird.label}</span>
    </div>
  );
}
