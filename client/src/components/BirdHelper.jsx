import React, { useState } from 'react';
import { nakshatraOptions, lagnaOptions, birdOptions, dayPakshaBirdMap, tithiPakshaBirdMap, weekdayOptions } from '../shared/constants.js';
import { IconSearch, IconVulture, IconOwl, IconCrow, IconHen, IconPeacock } from './Icons.jsx';

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
  if (!bird) return <span className="text-slate-300 text-[11px] font-bold w-16 text-right">—</span>;
  const Icon = BIRD_ICONS[bird.key];
  return (
    <button
      onClick={() => onSelect?.(bird.id)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all shrink-0"
    >
      {Icon && <Icon size={12} />}
      <span className="text-[11px] font-black whitespace-nowrap">{lang === 'ta' ? bird.tamil : bird.label}</span>
    </button>
  );
}

function Sel({ value, onChange, options, lang }) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 flex-1 min-w-0"
    >
      {options.map(o => (
        <option key={o.id} value={o.id}>{lang === 'ta' ? o.tamil : o.label}</option>
      ))}
    </select>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-none">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide shrink-0 w-14">{label}</span>
      {children}
    </div>
  );
}

function Section({ title }) {
  return (
    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mt-4 mb-1 first:mt-0">
      {title}
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
    <div className="glass-card overflow-hidden p-0 animate-in fade-in duration-500 border-none ring-1 ring-slate-100/50">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <IconSearch size={15} className="text-amber-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
          {tl ? 'பட்சி வழிகாட்டி' : 'Bird Reference'}
        </h3>
      </div>

      <div className="p-4 max-h-[640px] overflow-y-auto scrollbar-hide space-y-0">

        {/* Nakshatra */}
        <Section title={tl ? 'நட்சத்திர பட்சி' : 'Star Bird'} />
        <Row label={tl ? 'நட்சத்திரம்' : 'Star'}>
          <Sel value={nakshatra} onChange={setNakshatra} options={nakshatraOptions} lang={lang} />
          <BirdResult birdId={nakshatraBird} lang={lang} onSelect={onSelectBird} />
        </Row>

        {/* Lagna */}
        <Section title={tl ? 'லக்னம் பட்சி' : 'Lagna Bird'} />
        <Row label={tl ? 'லக்னம்' : 'Lagna'}>
          <Sel value={lagna} onChange={setLagna} options={lagnaOptions} lang={lang} />
          <BirdResult birdId={lagnaBird} lang={lang} onSelect={onSelectBird} />
        </Row>

        {/* Tithi Bright */}
        <Section title={tl ? 'திதி பட்சி — வளர்பிறை' : 'Tithi Bird — Bright Half'} />
        <Row label={tl ? 'திதி' : 'Tithi'}>
          <Sel value={tithiBright} onChange={setTithiBright} options={TITHI_OPTIONS} lang={lang} />
          <BirdResult birdId={tithiBrightBird} lang={lang} onSelect={onSelectBird} />
        </Row>

        {/* Tithi Dark */}
        <Section title={tl ? 'திதி பட்சி — தேய்பிறை' : 'Tithi Bird — Dark Half'} />
        <Row label={tl ? 'திதி' : 'Tithi'}>
          <Sel value={tithiDark} onChange={setTithiDark} options={TITHI_OPTIONS} lang={lang} />
          <BirdResult birdId={tithiDarkBird} lang={lang} onSelect={onSelectBird} />
        </Row>

        {/* Day Bird — Bright Half */}
        <Section title={tl ? 'நாள் பட்சி — வளர்பிறை' : 'Day Bird — Bright Half'} />
        <Row label={tl ? 'பகல்' : 'Day'}>
          <Sel value={dbDay} onChange={setDbDay} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={dbDayBird} lang={lang} onSelect={onSelectBird} />
        </Row>
        <Row label={tl ? 'இரவு' : 'Night'}>
          <Sel value={dbNight} onChange={setDbNight} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={dbNightBird} lang={lang} onSelect={onSelectBird} />
        </Row>

        {/* Day Bird — Dark Half */}
        <Section title={tl ? 'நாள் பட்சி — தேய்பிறை' : 'Day Bird — Dark Half'} />
        <Row label={tl ? 'பகல்' : 'Day'}>
          <Sel value={ddDay} onChange={setDdDay} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={ddDayBird} lang={lang} onSelect={onSelectBird} />
        </Row>
        <Row label={tl ? 'இரவு' : 'Night'}>
          <Sel value={ddNight} onChange={setDdNight} options={WEEKDAY_OPTS} lang={lang} />
          <BirdResult birdId={ddNightBird} lang={lang} onSelect={onSelectBird} />
        </Row>

      </div>
    </div>
  );
}
