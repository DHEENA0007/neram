import React, { useState } from 'react';
import { nakshatraOptions, lagnaOptions, birdOptions, dayPakshaBirdMap, tithiPakshaBirdMap, weekdayOptions, pakshaOptions } from '../shared/constants.js';
import { IconArrowRight, IconSearch } from './Icons.jsx';

export function BirdHelper({ lang, onSelectBird }) {
  const [activeTab, setActiveTab] = useState('star'); // 'star', 'lagna', 'day'

  const t = {
    en: {
      title: 'Find Your Bird',
      subtitle: 'Identify your Pancha Pakshi bird by birth star, lagna, or current day/tithi',
      star: 'By Star',
      lagna: 'By Lagna',
      day: 'By Day/Tithi Guide',
      select: 'Select',
    },
    ta: {
      title: 'உங்கள் பட்சியை கண்டறியவும்',
      subtitle: 'உங்கள் நட்சத்திரம், லக்னம் அல்லது திதியின் அடிப்படையில் பட்சியை அறியுங்கள்',
      star: 'நட்சத்திரம்',
      lagna: 'லக்னம்',
      day: 'நாள்/திதி வழிகாட்டி',
      select: 'தேர்ந்தெடு',
    }
  }[lang];

  const List = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
      {items.map((item) => {
        const bird = birdOptions.find(b => b.id === item.birdId);
        return (
          <button
            key={item.id}
            onClick={() => onSelectBird(item.birdId)}
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all group"
          >
            <div className="flex flex-col text-left">
              <span className="text-sm font-black text-slate-800">{lang === 'ta' ? item.tamil : item.label}</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mt-1">
                {lang === 'ta' ? bird?.tamil : bird?.label}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <IconArrowRight size={14} />
            </div>
          </button>
        );
      })}
    </div>
  );

  const DayGuide = () => (
    <div className="p-4 space-y-6">
      {pakshaOptions.map(paksha => (
        <div key={paksha.key} className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 border-l-2 border-amber-500 pl-3">
            {lang === 'ta' ? paksha.tamil : paksha.label}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {birdOptions.map(bird => {
              const dayBirds = dayPakshaBirdMap[paksha.key].day;
              const days = Object.entries(dayBirds).filter(([_, bId]) => bId === bird.id).map(([d]) => weekdayOptions.find(opt => opt.index === Number(d)));
              const nightBirds = dayPakshaBirdMap[paksha.key].night;
              const nights = Object.entries(nightBirds).filter(([_, bId]) => bId === bird.id).map(([d]) => weekdayOptions.find(opt => opt.index === Number(d)));
              
              if (days.length === 0 && nights.length === 0) return null;

              return (
                <div key={bird.id} className="p-4 rounded-2xl bg-white border border-slate-100">
                  <div className="text-sm font-black text-slate-800 mb-3">{lang === 'ta' ? bird.tamil : bird.label}</div>
                  <div className="space-y-2">
                    {days.length > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase w-12">{lang === 'ta' ? 'பகல்' : 'Day'}:</span>
                        <div className="flex flex-wrap gap-1">
                          {days.map(d => <span key={d.index} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">{lang === 'ta' ? d.tamil : d.label}</span>)}
                        </div>
                      </div>
                    )}
                    {nights.length > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase w-12">{lang === 'ta' ? 'இரவு' : 'Night'}:</span>
                        <div className="flex flex-wrap gap-1">
                          {nights.map(d => <span key={d.index} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">{lang === 'ta' ? d.tamil : d.label}</span>)}
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
    <div className="glass-card overflow-hidden p-0 animate-in fade-in duration-500 mb-12">
      <div className="p-6 bg-gradient-to-br from-slate-50 to-white/50 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <IconSearch size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">{t.title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {['star', 'lagna', 'day'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-500 border border-slate-100'}`}
            >
              {t[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50/10">
        {activeTab === 'star' && <List items={nakshatraOptions} />}
        {activeTab === 'lagna' && <List items={lagnaOptions} />}
        {activeTab === 'day' && <DayGuide />}
      </div>
    </div>
  );
}
