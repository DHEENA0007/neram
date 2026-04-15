import { useState } from 'react';
import { birdOptions } from '../shared/constants.js';
import { IconArrowRight, IconVulture, IconOwl, IconCrow, IconHen, IconPeacock } from './Icons.jsx';

const BIRD_ICONS = {
  vulture: IconVulture,
  owl: IconOwl,
  crow: IconCrow,
  cock: IconHen,
  peacock: IconPeacock
};

const VOWEL_TO_BIRD = {
  '\u0B85': 1, '\u0B86': 1, '\u0B90': 1, '\u0B94': 1,
  '\u0B87': 2, '\u0B88': 2,
  '\u0B89': 3, '\u0B8A': 3,
  '\u0B8E': 4, '\u0B8F': 4,
  '\u0B92': 5, '\u0B93': 5,
};

const SIGN_TO_BIRD = {
  '\u0BBE': 1, '\u0BC8': 1, '\u0BCC': 1,
  '\u0BBF': 2, '\u0BC0': 2,
  '\u0BC1': 3, '\u0BC2': 3,
  '\u0BC6': 4, '\u0BC7': 4,
  '\u0BCA': 5, '\u0BCB': 5
};

function getBirdFromName(name) {
  if (!name) return null;
  const normalized = name.toLowerCase();
  const chars = [...normalized];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (VOWEL_TO_BIRD[char]) return VOWEL_TO_BIRD[char];
    const code = char.charCodeAt(0);
    const isTamilConsonant = (code >= 0x0B95 && code <= 0x0BB9) || (code >= 0x0BD0 && code <= 0x0BD7);
    if (isTamilConsonant) {
      const nextChar = chars[i + 1];
      if (nextChar === '\u0BCD') continue; 
      if (SIGN_TO_BIRD[nextChar]) return SIGN_TO_BIRD[nextChar];
      return 1; 
    }
    if (char === 'a') return 1;
    if (char === 'i') return 2;
    if (char === 'u') return 3;
    if (char === 'e') return 4;
    if (char === 'o') return 5;
  }
  return null;
}

export function NameBirdSection({ onUpdateBird, lang }) {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  
  const bird1Id = getBirdFromName(name1);
  const bird2Id = getBirdFromName(name2);
  const bird1 = birdOptions.find(b => b.id === bird1Id);
  const bird2 = birdOptions.find(b => b.id === bird2Id);

  const t = {
    en: { title: 'Peyar Pakshi', p1: 'Your Name', p2: 'Opposite Name', result: 'Result:', sync: 'Use' },
    ta: { title: 'பெயர் பட்சி', p1: 'உங்கள் பெயர்', p2: 'எதிராளி பெயர்', result: 'பட்சி:', sync: 'மாற்று' }
  }[lang];

  return (
    <div className="glass-card p-4 border-none bg-indigo-600 shadow-lg shadow-indigo-600/20">
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t.title}</h4>
        
        <div className="grid grid-cols-1 gap-3">
            {/* NAME 1 */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl outline-none focus:bg-white/20 text-xs font-bold text-white placeholder:text-white/30"
                      value={name1}
                      onChange={(e) => setName1(e.target.value)}
                      placeholder={t.p1}
                    />
                    {bird1 && (
                        <button 
                          onClick={() => onUpdateBird(bird1.id)}
                          className="w-8 h-8 bg-amber-400 text-amber-950 rounded-lg flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                          title={t.sync}
                        >
                          <IconArrowRight size={14} className="-rotate-90" />
                        </button>
                    )}
                </div>
                {bird1 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/5 border-t-white/10">
                        <BirdBadge bird={bird1} lang={lang} label={t.result} />
                    </div>
                )}
            </div>

            {/* NAME 2 */}
            <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl outline-none focus:bg-white/20 text-xs font-bold text-white placeholder:text-white/30"
                      value={name2}
                      onChange={(e) => setName2(e.target.value)}
                      placeholder={t.p2}
                    />
                </div>
                {bird2 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/5 border-t-white/10">
                        <BirdBadge bird={bird2} lang={lang} label={t.result} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

function BirdBadge({ bird, lang, label }) {
    const Icon = BIRD_ICONS[bird.key];
    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-indigo-600">
                <Icon size={16} />
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-[8px] font-black text-white/50 uppercase tracking-tighter">{label}</span>
                <span className="text-xs font-black text-white">{lang === 'ta' ? bird.tamil : bird.label}</span>
            </div>
        </div>
    );
}
