import React, { useState } from 'react';
import { nakshatraOptions, lagnaOptions, birdOptions, dayPakshaBirdMap, tithiPakshaBirdMap, weekdayOptions } from '../shared/constants.js';
import { IconSearch, IconVulture, IconOwl, IconCrow, IconHen, IconPeacock, IconStar, IconSun, IconMoon } from './Icons.jsx';

const BIRD_ICONS = {
  vulture: IconVulture, owl: IconOwl, crow: IconCrow, cock: IconHen, peacock: IconPeacock,
};

const TITHI_OPTIONS = [
  { id: 1,  tamil: 'பிரதமை',     label: 'Prathama' },
  { id: 2,  tamil: 'துவிதியை',   label: 'Dvitiya' },
  { id: 3,  tamil: 'திரிதியை',   label: 'Tritiya' },
  { id: 4,  tamil: 'சதுர்த்தி',  label: 'Chaturthi' },
  { id: 5,  tamil: 'பஞ்சமி',     label: 'Panchami' },
  { id: 6,  tamil: 'சஷ்டி',      label: 'Shashti' },
  { id: 7,  tamil: 'சப்தமி',     label: 'Saptami' },
  { id: 8,  tamil: 'அஷ்டமி',     label: 'Ashtami' },
  { id: 9,  tamil: 'நவமி',       label: 'Navami' },
  { id: 10, tamil: 'தசமி',       label: 'Dashami' },
  { id: 11, tamil: 'ஏகாதசி',     label: 'Ekadashi' },
  { id: 12, tamil: 'துவாதசி',    label: 'Dvadashi' },
  { id: 13, tamil: 'திரயோதசி',   label: 'Trayodashi' },
  { id: 14, tamil: 'சதுர்தசி',   label: 'Chaturdashi' },
  { id: 15, tamil: 'பௌர்ணமி',    label: 'Poornima' },
];

const WEEKDAY_OPTS = weekdayOptions.map(w => ({ id: w.index, tamil: w.tamil, label: w.label }));

function BirdResult({ birdId, lang, onSelect }) {
  const bird = birdId != null ? birdOptions.find(b => b.id === Number(birdId)) : null;
  if (!bird) return <span className="text-slate-300 text-[10px] w-10 text-center">—</span>;
  const Icon = BIRD_ICONS[bird.key];
  return (
    <button
      onClick={() => onSelect?.(bird.id)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50 hover:border-amber-400 hover:shadow-sm active:scale-95 transition-all shrink-0 group/btn"
    >
      {Icon && <Icon size={14} className="group-hover/btn:scale-110 transition-transform" />}
      <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{lang === 'ta' ? bird.tamil : bird.label}</span>
    </button>
  );
}

function CustomSel({ value, onChange, options, lang }) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/5 transition-all w-32 cursor-pointer shadow-none"
    >
      {options.map(o => (
        <option key={o.id} value={o.id}>{lang === 'ta' ? o.tamil : o.label}</option>
      ))}
    </select>
  );
}

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-3 px-1">
      <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
        <Icon size={12} />
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
        {title}
      </h4>
      <div className="flex-1 h-px bg-slate-100/80 ml-2" />
    </div>
  );
}

function DataRow({ label, children }) {
  return (
    <div className="group flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest pl-2">{label}</span>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

export function BirdHelper({ lang, onSelectBird }) {
  const [nakshatra, setNakshatra]       = useState(nakshatraOptions[0].id);
  const [lagna, setLagna]               = useState(lagnaOptions[0].id);
  const [tithiBright, setTithiBright]   = useState(1);
  const [tithiDark, setTithiDark]       = useState(1);
  const [dbDay, setDbDay]               = useState(0);
  const [dbNight, setDbNight]           = useState(0);
  const [ddDay, setDdDay]               = useState(0);
  const [ddNight, setDdNight]           = useState(0);
  const tl = lang === 'ta';

  // Derived bird IDs
  const nakshatraBird  = nakshatraOptions.find(n => n.id === nakshatra)?.birdId;
  const lagnaBird      = lagnaOptions.find(l => l.id === lagna)?.birdId;
  const tithiBrightBird = tithiPakshaBirdMap.bright[tithiBright];
  const tithiDarkBird   = tithiPakshaBirdMap.dark[tithiDark];
  const dbDayBird       = dayPakshaBirdMap.bright.day[dbDay];
  const dbNightBird     = dayPakshaBirdMap.bright.night[dbNight];
  const ddDayBird       = dayPakshaBirdMap.dark.day[ddDay];
  const ddNightBird     = dayPakshaBirdMap.dark.night[ddNight];

  return (
    <div className="glass-card overflow-hidden p-0 animate-in fade-in duration-700 border-none ring-1 ring-slate-100/80 bg-white/90 backdrop-blur-sm shadow-card-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-none ring-1 ring-amber-500/10">
            <IconSearch size={16} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
            {tl ? 'பட்சி வழிகாட்டி' : 'Bird Reference'}
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-5 max-h-[700px] overflow-y-auto scrollbar-hide space-y-1">

        <SectionHeader title={tl ? 'நட்சத்திர பட்சி' : 'Star Bird'} icon={IconStar} />
        <DataRow label={tl ? 'நட்சத்திரம்' : 'Star'}>
          <CustomSel value={nakshatra} onChange={setNakshatra} options={nakshatraOptions} lang={lang} />
          <BirdResult birdId={nakshatraBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>

        <SectionHeader title={tl ? 'லக்னம் பட்சி' : 'Lagna Bird'} icon={IconSun} />
        <DataRow label={tl ? 'லக்னம்' : 'Lagna'}>
          <CustomSel value={lagna} onChange={setLagna} options={lagnaOptions} lang={lang} />
          <BirdResult birdId={lagnaBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>

        <SectionHeader title={tl ? 'திதி பட்சி' : 'Tithi Bird'} icon={IconMoon} />
        <DataRow label={tl ? 'வளர்பிறை' : 'Bright'}>
          <CustomSel value={tithiBright} onChange={setTithiBright} options={TITHI_OPTIONS} lang={lang} />
          <BirdResult birdId={tithiBrightBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>
        <DataRow label={tl ? 'தேய்பிறை' : 'Dark'}>
          <CustomSel value={tithiDark} onChange={setTithiDark} options={TITHI_OPTIONS} lang={lang} />
          <BirdResult birdId={tithiDarkBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>

        <SectionHeader title={tl ? 'நாள் பட்சி — வளர்பிறை' : 'Day Bird — Bright'} icon={IconSun} />
        <DataRow label={tl ? 'பகல்' : 'Day'}>
          <CustomSel value={dbDay} onChange={setDbDay} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={dbDayBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>
        <DataRow label={tl ? 'இரவு' : 'Night'}>
          <CustomSel value={dbNight} onChange={setDbNight} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={dbNightBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>

        <SectionHeader title={tl ? 'நாள் பட்சி — தேய்பிறை' : 'Day Bird — Dark'} icon={IconMoon} />
        <DataRow label={tl ? 'பகல்' : 'Day'}>
          <CustomSel value={ddDay} onChange={setDdDay} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={ddDayBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>
        <DataRow label={tl ? 'இரவு' : 'Night'}>
          <CustomSel value={ddNight} onChange={setDbNight} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={ddNightBird} lang={lang} onSelect={onSelectBird} />
        </DataRow>

      </div>
    </div>
  );
}
