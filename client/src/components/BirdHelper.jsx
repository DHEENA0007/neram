import React, { useState } from 'react';
import { nakshatraOptions, lagnaOptions, birdOptions, dayPakshaBirdMap, tithiPakshaBirdMap, weekdayOptions, pakshaOptions } from '../shared/constants.js';
import { IconArrowRight, IconSearch } from './Icons.jsx';

export function BirdHelper({ lang, onSelectBird }) {
  const [activeTab, setActiveTab] = useState('day'); // 'day', 'star', 'lagna'

  const t = {
    en: {
      title: 'Bird Knowledge',
      subtitle: 'Identify your bird by birth star, lagna, or guide',
      star: 'By Star',
      lagna: 'By Lagna',
      day: 'Day Guide',
      select: 'Select',
    },
    ta: {
      title: 'பட்சி வழிகாட்டி',
      subtitle: 'நட்சத்திரம் அல்லது லக்னம் மூலம் உங்கள் பட்சியை அறியுங்கள்',
      star: 'நட்சத்திரம்',
      lagna: 'லக்னம்',
      day: 'தினசரி வழிகாட்டி',
      select: 'தேர்ந்தெடு',
    }
  }[lang];

  const List = ({ items }) => (
    <div className="grid grid-cols-1 gap-2 p-2 max-h-[400px] overflow-y-auto scrollbar-hide">
      {items.map((item) => {
        const bird = birdOptions.find(b => b.id === item.birdId);
        return (
          <button
            key={item.id}
            onClick={() => onSelectBird(item.birdId)}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all group"
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-800">{lang === 'ta' ? item.tamil : item.label}</span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-amber-600">
                {lang === 'ta' ? bird?.tamil : bird?.label}
              </span>
            </div>
            <IconArrowRight size={12} className="text-slate-300 group-hover:text-amber-500" />
          </button>
        );
      })}
    </div>
  );

  const DayGuide = () => (
    <div className="p-3 space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
      {pakshaOptions.map(paksha => (
        <div key={paksha.key} className="space-y-3">
          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {lang === 'ta' ? paksha.tamil : paksha.label}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {birdOptions.map(bird => {
              const dayBirds = dayPakshaBirdMap[paksha.key].day;
              const days = Object.entries(dayBirds).filter(([_, bId]) => bId === bird.id).map(([d]) => weekdayOptions.find(opt => opt.index === Number(d)));
              const nightBirds = dayPakshaBirdMap[paksha.key].night;
              const nights = Object.entries(nightBirds).filter(([_, bId]) => bId === bird.id).map(([d]) => weekdayOptions.find(opt => opt.index === Number(d)));
              
              if (days.length === 0 && nights.length === 0) return null;

              return (
                <div key={bird.id} className="p-3 rounded-xl bg-white border border-slate-100">
                  <div className="text-xs font-black text-slate-800 mb-2">{lang === 'ta' ? bird.tamil : bird.label}</div>
                  <div className="space-y-1">
                    {days.length > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-[8px] font-bold text-slate-400 uppercase w-8">{lang === 'ta' ? 'பகல்' : 'Day'}:</span>
                        <div className="flex flex-wrap gap-1">
                          {days.map(d => <span key={d.index} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[8px] font-bold">{lang === 'ta' ? d.tamil : d.label}</span>)}
                        </div>
                      </div>
                    )}
                    {nights.length > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-[8px] font-bold text-slate-400 uppercase w-8">{lang === 'ta' ? 'இரவு' : 'Night'}:</span>
                        <div className="flex flex-wrap gap-1">
                          {nights.map(d => <span key={d.index} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-bold">{lang === 'ta' ? d.tamil : d.label}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="glass-card overflow-hidden p-0 animate-in fade-in duration-500 border-none ring-1 ring-slate-100/50">
      <div className="p-4 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <IconSearch size={16} className="text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{t.title}</h3>
        </div>

        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200">
          {['day', 'star', 'lagna'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/50">
        {activeTab === 'star' && <List items={nakshatraOptions} />}
        {activeTab === 'lagna' && <List items={lagnaOptions} />}
        {activeTab === 'day' && <DayGuide />}
      </div>
    </div>
  );
}
