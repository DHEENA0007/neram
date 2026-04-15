import React from 'react';

function formatPeriodTime(period) {
  if (!period) return '—';
  if (typeof period === 'string') return period;
  return `${period.startLabel} – ${period.endLabel}`;
}

export function SpecialPeriods({ periods, lang }) {
  if (!periods) return null;

  const t = {
    en: { rahu: 'Rahu Kaalam', yama: 'Yamagandam', kuli: 'Kulikai' },
    ta: { rahu: 'ராகு காலம்', yama: 'எமகண்டம்', kuli: 'குளிகன்' }
  }[lang];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PeriodCard label={t.rahu} time={formatPeriodTime(periods.rahu)} color="rose" />
      <PeriodCard label={t.yama} time={formatPeriodTime(periods.yamagandam)} color="amber" />
      <PeriodCard label={t.kuli} time={formatPeriodTime(periods.kulikai)} color="indigo" />
    </div>
  );
}

function PeriodCard({ label, time, color }) {
  const colorMap = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100/50',
    amber: 'bg-amber-50 text-amber-600 border-amber-100/50',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100/50'
  };

  return (
    <div className={`px-5 py-4 rounded-3xl border flex flex-col gap-1 transition-transform hover:scale-[1.02] duration-300 ${colorMap[color] || colorMap.amber}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</span>
      <strong className="text-xl font-black tracking-tight tabular-nums">{time}</strong>
    </div>
  );
}
