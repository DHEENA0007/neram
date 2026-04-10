import { useState, useEffect } from 'react';
import { birdOptions } from '../shared/constants.js';

const BIRD_MAP = {
  1: 1, // Vature (அ, ஆ, ஐ, ஔ)
  2: 2, // Owl (இ, ஈ)
  3: 3, // Crow (உ, ஊ)
  4: 4, // Cock (எ, ஏ)
  5: 5, // Peacock (ஒ, ஓ)
};

const VOWEL_TO_BIRD = {
  // Independent Vowels
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
  const chars = [...name]; // Iterate correctly over Unicode
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    // 1. Is it an independent vowel?
    if (VOWEL_TO_BIRD[char]) return VOWEL_TO_BIRD[char];
    
    // 2. Is it a consonant? (Tamil consonants: 0B95 - 0BB9, Grantha: 0BD0 etc)
    const code = char.charCodeAt(0);
    const isConsonant = (code >= 0x0B95 && code <= 0x0BB9) || (code >= 0x0BD0 && code <= 0x0BD7);
    
    if (isConsonant) {
      // Check next char for vowel sign
      const nextChar = chars[i + 1];
      if (nextChar === '\u0BCD') { // Pulli (virama) - skip to next consonant
        continue;
      }
      if (SIGN_TO_BIRD[nextChar]) {
        return SIGN_TO_BIRD[nextChar];
      }
      // No vowel sign? Implied 'அ'
      return 1;
    }
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
      result1: "Your Bird:",
      result2: "Opponent / Target Bird:",
      apply: "Use this bird"
    },
    ta: {
      title: 'பெயர் பட்சி',
      label1: 'ஜாதகரின் பெயர் / உங்கள் பெயர்',
      label2: 'பட்சி பார்க்க விரும்பும் நபர் / பொருள் / இடம் /etc பெயர்',
      result1: 'உங்கள் பட்சி',
      result2: 'எதிராளிor etc பட்சி',
      apply: 'இதைப் பயன்படுத்தவும்'
    }
  };
  
  const text = L[lang] || L.ta;

  return (
    <div className="pp-name-section">
      <h3 className="pp-name-title">{text.title}</h3>
      <div className="pp-name-grid">
        {/* Row 1 */}
        <div className="pp-name-field-wrap">
          <label className="pp-name-label">{text.label1}</label>
          <div className="pp-name-input-row">
            <input 
              type="text" 
              className="text-input pp-name-input" 
              value={name1} 
              onChange={(e) => setName1(e.target.value)}
              placeholder="..."
            />
            <div className="pp-name-result">
              <span className="pp-name-res-label">{text.result1}</span>
              <strong className="pp-name-res-value">{bird1 ? (lang === 'ta' ? bird1.tamil : bird1.label) : '—'}</strong>
              {bird1 && (
                <button 
                  type="button" 
                  className="pp-apply-btn"
                  onClick={() => onUpdateBird(bird1.id)}
                >
                  {text.apply}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Row 2 */}
        <div className="pp-name-field-wrap">
          <label className="pp-name-label">{text.label2}</label>
          <div className="pp-name-input-row">
            <input 
              type="text" 
              className="text-input pp-name-input" 
              value={name2} 
              onChange={(e) => setName2(e.target.value)}
              placeholder="..."
            />
            <div className="pp-name-result secondary">
              <span className="pp-name-res-label">{text.result2}</span>
              <strong className="pp-name-res-value">{bird2 ? (lang === 'ta' ? bird2.tamil : bird2.label) : '—'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
