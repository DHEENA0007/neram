import { useState } from 'react';
import { birdOptions } from '../shared/constants.js';

const VOWEL_TO_BIRD = {
  '\u0B85': 1, '\u0B86': 1, '\u0B90': 1, '\u0B94': 1, // அ, ஆ, ஐ, ஔ
  '\u0B87': 2, '\u0B88': 2,                          // இ, ஈ
  '\u0B89': 3, '\u0B8A': 3,                          // உ, ஊ
  '\u0B8E': 4, '\u0B8F': 4,                          // எ, ஏ
  '\u0B92': 5, '\u0B93': 5,                          // ஒ, ஓ
};

const SIGN_TO_BIRD = {
  '\u0BBE': 1, '\u0BC8': 1, '\u0BCC': 1, // ா, ை, ௌ
  '\u0BBF': 2, '\u0BC0': 2,             // ி, ீ
  '\u0BC1': 3, '\u0BC2': 3,             // ு, ூ
  '\u0BC6': 4, '\u0BC7': 4,             // ெ, ே
  '\u0BCA': 5, '\u0BCB': 5              // ொ, ோ
};

function getBirdFromName(name) {
  if (!name) return null;
  const normalized = name.toLowerCase();
  
  const doubleVowels = [
    { seq: 'ai', bird: 1 }, { seq: 'au', bird: 1 },
    { seq: 'ee', bird: 2 }, { seq: 'oo', bird: 3 }, { seq: 'ae', bird: 4 }
  ];
  
  let firstCluster = { pos: Infinity, bird: null };
  for (const dv of doubleVowels) {
    const p = normalized.indexOf(dv.seq);
    if (p !== -1 && p < firstCluster.pos) firstCluster = { pos: p, bird: dv.bird };
  }

  const chars = [...normalized];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (i === firstCluster.pos || i > firstCluster.pos) return firstCluster.bird;

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

  const L = {
    en: {
      title: 'Name Bird Calculator',
      label1: "Native's Name / Your Name",
      label2: "Person / Object / Place Name",
      result: "Resulting Bird:",
      sync: "Sync to form"
    },
    ta: {
      title: 'பெயர் பட்சி',
      label1: 'ஜாதகரின் பெயர் / உங்கள் பெயர்',
      label2: 'எதிராளி / பொருள் / இடம் பெயர்',
      result: 'கண்டறியப்பட்ட பட்சி:',
      sync: 'படிவத்திற்கு மாற்று'
    }
  };
  
  const text = L[lang] || L.ta;

  return (
    <div className="glass-card overflow-hidden">
      <div className="bg-amber-400 px-6 py-3 flex items-center justify-between">
        <h3 className="text-lg font-black text-amber-950 tracking-tight">{text.title}</h3>
        <span className="text-xl animate-bounce-slow">🐦</span>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{text.label1}</label>
          <div className="space-y-6">
            <div className="relative">
              <input
                className="input-field text-base font-bold pr-12"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="..."
              />
              <button 
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bird1 ? 'bg-yellow-100 text-yellow-600 hover:scale-110' : 'opacity-20 cursor-not-allowed'}`}
                onClick={() => bird1 && onUpdateBird(bird1.id)}
                disabled={!bird1}
                title={text.sync}
              >
                ▲
              </button>
            </div>
            
            {bird1 && (
              <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 animate-in zoom-in duration-300">
                <div className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm">
                  {bird1.emoji}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">{text.result}</span>
                  <strong className="text-xl font-black text-slate-900 leading-none">
                    {lang === 'ta' ? bird1.tamil : bird1.label}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-8 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-10">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{text.label2}</label>
          <div className="space-y-6">
            <input
              className="input-field text-base font-bold"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="..."
            />
            
            {bird2 && (
              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 animate-in zoom-in duration-300">
                <div className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm">
                  {bird2.emoji}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">{text.result}</span>
                  <strong className="text-xl font-black text-slate-900 leading-none">
                    {lang === 'ta' ? bird2.tamil : bird2.label}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
