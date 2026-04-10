import { useState } from 'react';
import { DateTime } from 'luxon';
import { birdOptions, activityOptions } from '../shared/constants.js';

const COL = {
  en: {
    yama: 'Yama', subBird: 'Sub Bird', subActivity: 'Sub Bird Activity',
    subTime: 'Sub Bird Time', relation: 'Relation', palan: 'Prediction',
    paduBird: 'Padu Bird', rulingBird: 'Ruling Bird',
    dayTable: 'Day Table', nightTable: 'Night Table',
  },
  ta: {
    yama: 'ஜாமம்', subBird: 'அந்தர பட்சி', subActivity: 'அந்தர பட்சி தொழில்',
    subTime: 'அந்தர பட்சி நேரம்', relation: 'உறவு', palan: 'பலன்',
    paduBird: 'படுபட்சி', rulingBird: 'அதிகார பட்சி',
    dayTable: 'பகல் அட்டவணை', nightTable: 'இரவு அட்டவணை',
  },
};

function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

const SOOKSHIMA_PAIRS = [
  { birdId: 1, activityKey: 'eating' },
  { birdId: 4, activityKey: 'dying' },
  { birdId: 2, activityKey: 'sleeping' },
  { birdId: 5, activityKey: 'ruling' },
  { birdId: 3, activityKey: 'walking' },
];

function getSookshimaDetails(parentBirdId, parentActivityKey, startISO, endISO, lang) {
  const startIndex = SOOKSHIMA_PAIRS.findIndex(
    p => p.birdId === parentBirdId && p.activityKey === parentActivityKey
  );
  
  const rotated = startIndex === -1 
    ? SOOKSHIMA_PAIRS 
    : [...SOOKSHIMA_PAIRS.slice(startIndex), ...SOOKSHIMA_PAIRS.slice(0, startIndex)];

  const start = DateTime.fromISO(startISO);
  const end = DateTime.fromISO(endISO);
  const totalDurationMs = end.diff(start).as('milliseconds');
  const stepMs = totalDurationMs / 5;

  return rotated.map((pair, i) => {
    const sTime = start.plus({ milliseconds: stepMs * i });
    const eTime = i === 4 ? end : start.plus({ milliseconds: stepMs * (i + 1) });
    
    const bird = birdOptions.find(b => b.id === pair.birdId);
    const activity = activityOptions.find(a => a.key === pair.activityKey);

    return {
      bird,
      activity,
      timeLabel: `${sTime.toFormat('h:mm a').toLowerCase()} to ${eTime.toFormat('h:mm a').toLowerCase()}`
    };
  });
}

export function ScheduleTable({ tone, yamas, lang = 'ta' }) {
  const [expanded, setExpanded] = useState({}); // { yamaIndex: { subIndex: true } }
  const c = COL[lang];

  const toggleExpand = (yIdx, sIdx) => {
    setExpanded(prev => {
      const yamaExp = prev[yIdx] || {};
      return {
        ...prev,
        [yIdx]: {
          ...yamaExp,
          [sIdx]: !yamaExp[sIdx]
        }
      };
    });
  };
  const first = yamas[0];
  const title = `${tone === 'day' ? c.dayTable : c.nightTable} (${c.paduBird}: ${n(first?.paduBird, lang)}, ${c.rulingBird}: ${n(first?.bharanaBird, lang)})`;

  return (
    <section className={`schedule-card tone-${tone}`}>
      <h2 className="pp-table-title">{title}</h2>
      <div className="table-wrap">
        <table className="pp-table">
          <thead>
            <tr>
              <th>{c.yama}</th>
              <th>{c.subBird}</th>
              <th>{c.subActivity}</th>
              <th>{c.subTime}</th>
              <th>{c.relation}</th>
              <th>{c.palan}</th>
            </tr>
          </thead>
          <tbody>
            {yamas.map((yama) => (
              <tr key={yama.index} className="pp-yama-row">
                {/* Yama */}
                <td className="pp-yama-cell">
                  <strong>{lang === 'ta' ? 'ஜாமம்' : 'Yama'} {yama.index}</strong>
                  <span className="pp-yama-time">{yama.startLabel} – {yama.endLabel}</span>
                  <span className="pp-yama-activity">{lang === 'ta' ? yama.mainActivity?.tamil : yama.mainActivity?.label}</span>
                </td>
                {/* Sub bird */}
                <td className="pp-sub-cell">
                  {yama.subRows.map((s, i) => {
                    const isExp = expanded[yama.index]?.[s.index];
                    return (
                      <div key={i} className="pp-sub-item-group">
                        <div className="pp-sub-item">{lang === 'ta' ? s.bird?.tamil : s.bird?.label}</div>
                        {isExp && getSookshimaDetails(s.bird?.id, s.activity?.key, s.start, s.end, lang).map((sk, j) => (
                          <div key={j} className="pp-sookshima-item pp-sookshima-bird">
                            {lang === 'ta' ? sk.bird?.tamil : sk.bird?.label}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </td>
                {/* Sub activity */}
                <td className="pp-sub-cell">
                  {yama.subRows.map((s, i) => {
                    const isExp = expanded[yama.index]?.[s.index];
                    return (
                      <div key={i} className="pp-sub-item-group">
                        <div className={`pp-sub-item pp-activity-${s.activity?.key}`}>
                          {lang === 'ta' ? s.activity?.tamil : s.activity?.label}
                        </div>
                        {isExp && getSookshimaDetails(s.bird?.id, s.activity?.key, s.start, s.end, lang).map((sk, j) => (
                          <div key={j} className={`pp-sookshima-item pp-activity-${sk.activity?.key}`}>
                            {lang === 'ta' ? sk.activity?.tamil : sk.activity?.label}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </td>
                {/* Sub time */}
                <td className="pp-sub-cell pp-time-cell">
                  {yama.subRows.map((s, i) => {
                    const isExp = expanded[yama.index]?.[s.index];
                    return (
                      <div key={i} className="pp-sub-item-group">
                        <div className="pp-sub-item pp-time-row">
                          <span>{s.startLabel} – {s.endLabel}</span>
                          <button 
                            className={`pp-expand-btn ${isExp ? 'active' : ''}`}
                            onClick={() => toggleExpand(yama.index, s.index)}
                            title="Split into 5"
                          >
                            +
                          </button>
                        </div>
                        {isExp && getSookshimaDetails(s.bird?.id, s.activity?.key, s.start, s.end, lang).map((sk, j) => (
                          <div key={j} className="pp-sookshima-item pp-sookshima-time">
                            {sk.timeLabel}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </td>
                {/* Relation */}
                <td className="pp-sub-cell">
                  {yama.subRows.map((s, i) => {
                    const isExp = expanded[yama.index]?.[s.index];
                    return (
                      <div key={i} className="pp-sub-item-group">
                        <div className={`pp-sub-item pp-relation-${s.relation?.key}`}>
                          {lang === 'ta' ? s.relation?.tamil : s.relation?.label}
                        </div>
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                      </div>
                    );
                  })}
                </td>
                {/* Palan */}
                <td className="pp-sub-cell pp-palan-cell">
                  {yama.subRows.map((s, i) => {
                    const isExp = expanded[yama.index]?.[s.index];
                    return (
                      <div key={i} className="pp-sub-item-group">
                        <div className="pp-sub-item pp-palan-text">
                          {s.palan || <span className="pp-no-palan">—</span>}
                        </div>
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                        {isExp && <div className="pp-sookshima-spacer" />}
                      </div>
                    );
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
