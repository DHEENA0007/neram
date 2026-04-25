import React, { useState } from 'react';

const CATEGORIES = [
  { key: 'rahu',     ta: 'ராகு காலம்',  en: 'Rahu Kalam',   color: 'rose' },
  { key: 'yama',     ta: 'எமகண்டம்',    en: 'Yamagandam',   color: 'orange' },
  { key: 'kuli',     ta: 'குளிகன்',     en: 'Kulikan',      color: 'violet' },
  { key: 'horai',    ta: 'ஹோரை',        en: 'Horai',        color: 'amber' },
  { key: 'schedule', ta: 'முழு அட்டவணை', en: 'Full Schedule', color: 'slate' },
];

const QUICK_RANGES = [
  { ta: '1 வாரம்',  en: '1 Week',    days: 7 },
  { ta: '1 மாதம்',  en: '1 Month',   days: 30 },
  { ta: '3 மாதம்',  en: '3 Months',  days: 90 },
  { ta: '6 மாதம்',  en: '6 Months',  days: 180 },
  { ta: '1 ஆண்டு',  en: '1 Year',    days: 365 },
];

// limits per category (max days feasible to print)
const CATEGORY_LIMITS = { rahu: 366, yama: 366, kuli: 366, horai: 60, schedule: 14 };

export function PrintOptionsModal({ onClose, onPrintSingle, onPrintRange, currentDate, lang, loading }) {
  const [mode, setMode]           = useState('single');
  const [fromDate, setFromDate]   = useState(currentDate);
  const [toDate, setToDate]       = useState(currentDate);
  const [categories, setCategories] = useState(['rahu', 'yama', 'kuli']);
  const [showSubTable, setShowSubTable] = useState(true);

  const tl = lang === 'ta';

  function applyQuickRange(days) {
    const from = new Date(currentDate);
    const to   = new Date(currentDate);
    to.setDate(to.getDate() + days - 1);
    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  }

  function toggleCat(key) {
    setCategories(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  }

  const diffDays = Math.round(
    (new Date(toDate) - new Date(fromDate)) / 86400000
  ) + 1;

  // warn if selected categories have tight limits
  const maxLimit = categories.length
    ? Math.min(...categories.map(c => CATEGORY_LIMITS[c] ?? 366))
    : 366;
  const overLimit = diffDays > maxLimit;

  function handlePrint() {
    if (mode === 'single') { onPrintSingle({ showSubTable }); return; }
    if (overLimit) return;
    onPrintRange({ fromDate, toDate, categories, showSubTable });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
            {tl ? 'அச்சு விருப்பங்கள்' : 'Print Options'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-black"
          >✕</button>
        </div>

        {/* Mode */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'single', ta: 'இந்த நாள் மட்டும்', en: 'This Day Only' },
            { key: 'range',  ta: 'தேதி வரிசை',        en: 'Date Range'   },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`py-3 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                mode === m.key
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-amber-200'
              }`}
            >
              {tl ? m.ta : m.en}
            </button>
          ))}
        </div>

        {mode === 'range' && (
          <>
            {/* Quick ranges */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {tl ? 'விரைவு தேர்வு' : 'Quick Select'}
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_RANGES.map(r => (
                  <button
                    key={r.days}
                    onClick={() => applyQuickRange(r.days)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-[10px] font-black uppercase tracking-wide transition-all"
                  >
                    {tl ? r.ta : r.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Date pickers */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'from', ta: 'தொடக்கம்', en: 'From', val: fromDate, set: setFromDate },
                { key: 'to',   ta: 'முடிவு',   en: 'To',   val: toDate,   set: setToDate   },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {tl ? f.ta : f.en}
                  </p>
                  <input
                    type="date"
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-amber-400"
                  />
                </div>
              ))}
            </div>

            {/* Day count */}
            <p className="text-[10px] font-bold text-slate-400 text-center">
              {diffDays > 0 ? `${diffDays} ${tl ? 'நாட்கள்' : 'days'}` : ''}
              {overLimit && (
                <span className="text-rose-500 ml-2">
                  ({tl ? `அதிகபட்சம் ${maxLimit} நாட்கள்` : `max ${maxLimit} days for selected categories`})
                </span>
              )}
            </p>

            {/* Categories */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {tl ? 'வகைகள்' : 'Categories'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => {
                  const on = categories.includes(cat.key);
                  return (
                    <button
                      key={cat.key}
                      onClick={() => toggleCat(cat.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-black transition-all text-left ${
                        on
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 text-[8px] ${on ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
                        {on && '✓'}
                      </span>
                      {tl ? cat.ta : cat.en}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Sub-table option */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {tl ? 'அட்டவணை விருப்பங்கள்' : 'Table Options'}
          </p>
          <button
            onClick={() => setShowSubTable(!showSubTable)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-black transition-all text-left w-full ${
              showSubTable
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 text-[8px] ${showSubTable ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
              {showSubTable && '✓'}
            </span>
            {tl ? 'அதி சூட்சும அட்டவணை (Sub Table)' : 'Include Sookshima Sub-Table'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wide hover:bg-slate-50 transition-all"
          >
            {tl ? 'ரத்து' : 'Cancel'}
          </button>
          <button
            onClick={handlePrint}
            disabled={loading || (mode === 'range' && (categories.length === 0 || overLimit || diffDays < 1))}
            className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wide disabled:opacity-40 transition-all"
          >
            {loading
              ? (tl ? 'தயாரிக்கிறது…' : 'Preparing…')
              : (tl ? 'அச்சிடு' : 'Print')}
          </button>
        </div>
      </div>
    </div>
  );
}
