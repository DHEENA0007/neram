import React from 'react';

export function SpecialPeriods({ periods, lang }) {
  if (!periods) return null;

  const items = [
    { 
      key: 'rahu', 
      label: lang === 'ta' ? 'ராகுகாலம்' : 'Rahu Kaalam', 
      data: periods.rahu,
      color: 'bg-red-50 text-red-700 border-red-100',
      iconColor: 'bg-red-500'
    },
    { 
      key: 'yamagandam', 
      label: lang === 'ta' ? 'எமகண்டம்' : 'Yamagandam', 
      data: periods.yamagandam,
      color: 'bg-orange-50 text-orange-700 border-orange-100',
      iconColor: 'bg-orange-500'
    },
    { 
      key: 'kulikai', 
      label: lang === 'ta' ? 'குளிகன்' : 'Kulikai', 
      data: periods.kulikai,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconColor: 'bg-emerald-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      {items.map((item) => (
        <div key={item.key} className={`flex flex-col p-4 rounded-3xl border ${item.color} shadow-sm transition-transform hover:scale-[1.02]`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${item.iconColor} animate-pulse`}></div>
            <span className="text-xs font-black uppercase tracking-[0.1em]">{item.label}</span>
          </div>
          <div className="text-lg font-black tracking-tight">
            {item.data.startLabel} – {item.data.endLabel}
          </div>
        </div>
      ))}
    </div>
  );
}
