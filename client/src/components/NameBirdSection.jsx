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
  const normalized = name.toLowerCase();
  
  // 1. Double/Multi-vowel clusters (High Priority)
  const doubleVowels = [
    { seq: 'ai', bird: 1 }, { seq: 'au', bird: 1 },
    { seq: 'ee', bird: 2 }, { seq: 'oo', bird: 3 }, { seq: 'ae', bird: 4 }
  ];
  
  let firstCluster = { pos: Infinity, bird: null };
  for (const dv of doubleVowels) {
    const p = normalized.indexOf(dv.seq);
    if (p !== -1 && p < firstCluster.pos) firstCluster = { pos: p, bird: dv.bird };
  }

  // 2. Scan character by character
  const chars = [...normalized];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    // Check if we hit a cluster
    if (i === firstCluster.pos) return firstCluster.bird;
    if (i > firstCluster.pos) return firstCluster.bird; // Safety

    // Tamil Independent Vowels
    if (VOWEL_TO_BIRD[char]) return VOWEL_TO_BIRD[char];
    
    // Tamil Consonants (plus check for vowel signs)
    const code = char.charCodeAt(0);
    const isTamilConsonant = (code >= 0x0B95 && code <= 0x0BB9) || (code >= 0x0BD0 && code <= 0x0BD7);
    if (isTamilConsonant) {
      const nextChar = chars[i + 1];
      if (nextChar === '\u0BCD') continue; // Skip dot (pulli)
      if (SIGN_TO_BIRD[nextChar]) return SIGN_TO_BIRD[nextChar];
      return 1; // Implied 'அ'
    }

    // English Single Vowels
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
      apply: 'பயன்படுத்தவும்'
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
            <div className="pp-name-input-group">
              <input 
                type="text" 
                className="text-input pp-name-input" 
                value={name1} 
                onChange={(e) => setName1(e.target.value)}
                placeholder="..."
              />
              <button 
                type="button" 
                className={`pp-name-action-btn ${bird1 ? 'active' : ''}`}
                onClick={() => bird1 && onUpdateBird(bird1.id)}
                disabled={!bird1}
              >
                ▼
              </button>
            </div>
            <div className="pp-name-result">
              <span className="pp-name-res-label">{text.result1}</span>
              <strong className="pp-name-res-value">{bird1 ? (lang === 'ta' ? bird1.tamil : bird1.label) : '—'}</strong>
            </div>
        </div>
        
        {/* Row 2 */}
        <div className="pp-name-field-wrap">
          <label className="pp-name-label">{text.label2}</label>
          <div className="pp-name-input-row">
            <div className="pp-name-input-group">
              <input 
                type="text" 
                className="text-input pp-name-input" 
                value={name2} 
                onChange={(e) => setName2(e.target.value)}
                placeholder="..."
              />
              <div className="pp-name-action-btn disabled">▼</div>
            </div>
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
