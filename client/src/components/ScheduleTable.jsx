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

export function ScheduleTable({ tone, yamas, lang = 'ta' }) {
  const c = COL[lang];
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
                  {yama.subRows.map((s, i) => (
                    <div key={i} className="pp-sub-item">{lang === 'ta' ? s.bird?.tamil : s.bird?.label}</div>
                  ))}
                </td>
                {/* Sub activity */}
                <td className="pp-sub-cell">
                  {yama.subRows.map((s, i) => (
                    <div key={i} className={`pp-sub-item pp-activity-${s.activity?.key}`}>
                      {lang === 'ta' ? s.activity?.tamil : s.activity?.label}
                    </div>
                  ))}
                </td>
                {/* Sub time */}
                <td className="pp-sub-cell pp-time-cell">
                  {yama.subRows.map((s, i) => (
                    <div key={i} className="pp-sub-item">{s.startLabel} – {s.endLabel}</div>
                  ))}
                </td>
                {/* Relation */}
                <td className="pp-sub-cell">
                  {yama.subRows.map((s, i) => (
                    <div key={i} className={`pp-sub-item pp-relation-${s.relation?.key}`}>
                      {lang === 'ta' ? s.relation?.tamil : s.relation?.label}
                    </div>
                  ))}
                </td>
                {/* Palan */}
                <td className="pp-sub-cell pp-palan-cell">
                  {yama.subRows.map((s, i) => (
                    <div key={i} className="pp-sub-item pp-palan-text">
                      {s.palan || <span className="pp-no-palan">—</span>}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
