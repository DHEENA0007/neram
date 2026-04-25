import React from 'react';

/* ── helpers ────────────────────────────────────────────────── */
function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

function fmtDate(d, lang) {
  return new Date(d).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

const ACTIVITY_COLORS = {
  ruling:   { bg: '#fef3c7', text: '#b45309' },
  eating:   { bg: '#d1fae5', text: '#047857' },
  walking:  { bg: '#dbeafe', text: '#1d4ed8' },
  sleeping: { bg: '#ede9fe', text: '#6d28d9' },
  dying:    { bg: '#ffe4e6', text: '#be123c' },
};

const GOWRI_COLORS = {
  good:  { dot: '#059669', text: '#059669' },
  bad:   { dot: '#dc2626', text: '#dc2626' },
};

const PLANET_DOTS = {
  sun:     '#f59e0b',
  moon:    '#6366f1',
  mars:    '#ef4444',
  mercury: '#22c55e',
  jupiter: '#f97316',
  venus:   '#ec4899',
  saturn:  '#1e293b',
};

function getSookshimaSlots(subRows, currentIndex, parentStart, parentEnd) {
  const start = new Date(parentStart).getTime();
  const end = new Date(parentEnd).getTime();
  const slotDuration = (end - start) / 5;
  const rotated = [...subRows.slice(currentIndex), ...subRows.slice(0, currentIndex)];
  return rotated.map((row, i) => {
    const s = start + i * slotDuration;
    const e = s + slotDuration;
    return {
      bird: row.bird,
      activity: row.activity,
      relation: row.relation,
      start: new Date(s).toISOString(),
      end: new Date(e).toISOString(),
      startLabel: new Date(s).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      endLabel: new Date(e).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  });
}

function getHorai(start, end, horaiList) {
  if (!horaiList?.length) return null;
  const mid = (new Date(start).getTime() + new Date(end).getTime()) / 2;
  return horaiList.find(h => mid >= new Date(h.start).getTime() && mid < new Date(h.end).getTime()) || null;
}

function getGowri(start, end, gowriList) {
  if (!gowriList?.length) return null;
  const mid = (new Date(start).getTime() + new Date(end).getTime()) / 2;
  return gowriList.find(g => mid >= new Date(g.start).getTime() && mid < new Date(g.end).getTime()) || null;
}

function getSpecialWarnings(start, end, sp) {
  if (!sp) return [];
  const s = new Date(start).getTime(), e = new Date(end).getTime();
  const warnings = [];
  for (const key of ['rahu', 'yamagandam', 'kulikai']) {
    const p = sp[key];
    if (!p) continue;
    const ps = new Date(p.start || p.startLabel).getTime();
    const pe = new Date(p.end || p.endLabel).getTime();
    if (ps < e && pe > s) warnings.push(key);
  }
  return warnings;
}

const SPECIAL_LABELS = {
  rahu:       { ta: 'ராகு',   en: 'Rahu',   color: '#be123c', bg: '#ffe4e6' },
  yamagandam: { ta: 'எமகண்டம்', en: 'Yama',  color: '#b45309', bg: '#fef3c7' },
  kulikai:    { ta: 'குளிகன்', en: 'Kuli',   color: '#6d28d9', bg: '#ede9fe' },
};

/* ── main PrintView ─────────────────────────────────────────── */
export function PrintView({ prediction, lang, locationName, showSubTable = true }) {
  if (!prediction) return null;

  const t = lang === 'ta';
  const sp = prediction.specialPeriods;
  const horai = prediction.horai || [];
  const gowri = prediction.gowri || [];
  const dayHorai = horai.filter(h => h.period === 'day');
  const nightHorai = horai.filter(h => h.period === 'night');
  const dayGowri = gowri.filter(g => g.period === 'day');
  const nightGowri = gowri.filter(g => g.period === 'night');
  const dayPaksha = prediction.paksha?.day;
  const nightPaksha = prediction.paksha?.night;

  const labels = {
    yama: t ? 'ஜாமம்' : 'Yama',
    bird: t ? 'பட்சி' : 'Bird',
    activity: t ? 'தொழில்' : 'Activity',
    relation: t ? 'உறவு' : 'Relation',
    time: t ? 'நேரம்' : 'Time',
    direction: t ? 'திசை' : 'Direction',
    palan: t ? 'பலன்' : 'Palan',
    strength: t ? 'பலம்' : 'Strength',
    sookshima: t ? 'அதி சூட்சும விவரம்' : 'Sookshima Breakdown',
  };

  const font = 'Inter, "Noto Sans Tamil", sans-serif';

  return (
    <div id="print-view" style={{
      display: 'none',
      fontFamily: font,
      color: '#0f172a',
      background: '#fff',
      padding: '12px 20px',
      fontSize: 8.5,
      lineHeight: 1.35,
    }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '3px solid #f59e0b', paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#b45309', letterSpacing: '-0.02em' }}>
              {t ? 'பஞ்சபட்சி அட்டவணை' : 'Pancha Pakshi Schedule'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {fmtDate(prediction.date, lang)}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 9, color: '#64748b' }}>
            <div style={{ fontWeight: 700 }}>{locationName}</div>
            <div style={{ marginTop: 2 }}>
              {t ? 'சூரிய உதயம்' : 'Sunrise'}:{' '}
              <strong>{new Date(prediction.astronomy?.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong>
            </div>
            <div>
              {t ? 'சூரிய அஸ்தமனம்' : 'Sunset'}:{' '}
              <strong>{new Date(prediction.astronomy?.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong>
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            [t ? 'பட்சி' : 'Bird', n(prediction.bird, lang)],
            [t ? 'கிழமை' : 'Weekday', n(prediction.weekday, lang)],
            [t ? 'பகல் பிறை' : 'Day Paksha', n(dayPaksha, lang)],
            [t ? 'இரவு பிறை' : 'Night Paksha', n(nightPaksha, lang)],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#1e293b' }}>{val || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SPECIAL PERIODS ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 9, fontWeight: 700 }}>
        {[
          [t ? 'ராகு காலம்' : 'Rahu Kalam', sp?.rahu, '#be123c'],
          [t ? 'எமகண்டம்' : 'Yamagandam', sp?.yamagandam, '#b45309'],
          [t ? 'குளிகன்' : 'Kulikan', sp?.kulikai, '#6d28d9'],
        ].map(([label, p, color]) => (
          <div key={label} style={{ color }}>
            {label}: {p ? `${p.startLabel} – ${p.endLabel}` : '—'}
          </div>
        ))}
      </div>

      {/* ── DAY SCHEDULE ───────────────────────────────────── */}
      <ScheduleBlock
        title={t ? 'பகல் அட்டவணை' : 'Day Schedule'}
        yamas={prediction.dayYamas}
        lang={lang}
        labels={labels}
        font={font}
        horai={horai}
        gowri={gowri}
        specialPeriods={sp}
        titleColor="#b45309"
        showSubTable={showSubTable}
      />

      {/* Page break before night */}
      <div style={{ pageBreakBefore: 'always' }} />

      {/* ── NIGHT SCHEDULE ─────────────────────────────────── */}
      <ScheduleBlock
        title={t ? 'இரவு அட்டவணை' : 'Night Schedule'}
        yamas={prediction.nightYamas}
        lang={lang}
        labels={labels}
        font={font}
        horai={horai}
        gowri={gowri}
        specialPeriods={sp}
        titleColor="#4f46e5"
        showSubTable={showSubTable}
      />

      {/* ── HORAI ────────────────────────────────────────────── */}
      <div style={{ pageBreakBefore: 'always' }} />
      <SectionTag>{t ? 'ஹோரை அட்டவணை' : 'Horai Schedule'}</SectionTag>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <HoraiBlock title={t ? 'பகல் ஹோரை' : 'Day Horai'} items={dayHorai} lang={lang} font={font} />
        </div>
        <div style={{ flex: 1 }}>
          <HoraiBlock title={t ? 'இரவு ஹோரை' : 'Night Horai'} items={nightHorai} lang={lang} font={font} />
        </div>
      </div>

      {/* ── GOWRI ────────────────────────────────────────────── */}
      <div style={{ marginTop: 16 }}>
        <SectionTag>{t ? 'கௌரி பஞ்சாங்கம்' : 'Gowri Panchangam'}</SectionTag>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <GowriBlock title={t ? 'பகல் கௌரி' : 'Day Gowri'} items={dayGowri} lang={lang} font={font} />
          </div>
          <div style={{ flex: 1 }}>
            <GowriBlock title={t ? 'இரவு கௌரி' : 'Night Gowri'} items={nightGowri} lang={lang} font={font} />
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 14, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#94a3b8' }}>
        <span>{t ? 'நேரம் — பஞ்சபட்சி கணினி' : 'Neram — Pancha Pakshi Calculator'}</span>
        <span>{new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ── Section Tag ───────────────────────────────────────────── */
function SectionTag({ children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{
        background: '#1e293b', color: '#fff', padding: '4px 10px',
        fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
        textTransform: 'uppercase', display: 'inline-block', borderRadius: 3
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── Schedule Block (matches app table exactly) ────────────── */
function ScheduleBlock({ title, yamas, lang, labels, font, horai, gowri, specialPeriods, titleColor, showSubTable }) {
  if (!yamas?.length) return null;
  const t = lang === 'ta';

  const thStyle = {
    padding: '5px 6px',
    fontSize: 7.5,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#64748b',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    textAlign: 'left',
  };

  const tdStyle = {
    padding: '4px 6px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
    fontSize: 8.5,
  };

  return (
    <div>
      <SectionTag>{title}</SectionTag>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 80 }}>{labels.yama}</th>
            <th style={{ ...thStyle, width: 60 }}>{labels.bird}</th>
            <th style={{ ...thStyle, width: 55 }}>{labels.activity}</th>
            <th style={{ ...thStyle, width: 45 }}>{labels.relation}</th>
            <th style={{ ...thStyle, width: 120 }}>{labels.time}</th>
            <th style={{ ...thStyle, width: 55 }}>{labels.direction}</th>
            <th style={thStyle}>{labels.palan}</th>
            <th style={{ ...thStyle, width: 40, textAlign: 'right' }}>{labels.strength}</th>
          </tr>
        </thead>
        <tbody>
          {yamas.map((yama) =>
            yama.subRows.map((s, i) => {
              const hora = getHorai(s.start, s.end, horai);
              const gowriSlot = getGowri(s.start, s.end, gowri);
              const warnings = getSpecialWarnings(s.start, s.end, specialPeriods);
              const isFirst = i === 0;
              const strengthNum = Number(s.strength);
              const strengthColor = strengthNum >= 60 ? '#059669' : strengthNum >= 30 ? '#b45309' : '#dc2626';

              return (
                <React.Fragment key={`${yama.index}-${i}`}>
                  <tr style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: isFirst ? '2px solid #e2e8f0' : undefined }}>
                    {/* Yama column */}
                    <td style={tdStyle}>
                      {isFirst && (
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 10, color: titleColor }}>
                            {t ? 'ஜாமம்' : 'Jamam'} {yama.index}
                          </div>
                          <div style={{ fontSize: 7, color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {yama.startLabel} – {yama.endLabel}
                          </div>
                          {yama.mainActivity && (
                            <div style={{ fontSize: 7, color: '#64748b', fontWeight: 700 }}>
                              {n(yama.mainActivity, lang)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Bird */}
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#1e293b' }}>
                      {n(s.bird, lang)}
                    </td>

                    {/* Activity badge */}
                    <td style={tdStyle}>
                      {s.activity && (() => {
                        const ac = ACTIVITY_COLORS[s.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                        return (
                          <span style={{
                            padding: '2px 6px', borderRadius: 4, fontSize: 7.5, fontWeight: 800,
                            background: ac.bg, color: ac.text, whiteSpace: 'nowrap',
                          }}>
                            {n(s.activity, lang)}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Relation */}
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#334155', fontSize: 8 }}>
                      {n(s.relation, lang)}
                    </td>

                    {/* Time + horai/gowri/warnings badges */}
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', fontSize: 8 }}>
                        {s.startLabel} – {s.endLabel}
                      </div>
                      {(hora || gowriSlot || warnings.length > 0) && (
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                          {hora && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '1px 4px', borderRadius: 3, fontSize: 7, fontWeight: 800,
                              background: '#f1f5f9', color: '#475569',
                            }}>
                              <span style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: PLANET_DOTS[hora.planet?.key] || '#94a3b8',
                              }} />
                              {t ? hora.planet?.tamil : hora.planet?.label}
                            </span>
                          )}
                          {gowriSlot && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '1px 4px', borderRadius: 3, fontSize: 7, fontWeight: 800,
                              color: GOWRI_COLORS[gowriSlot.type?.nature]?.text || '#475569',
                              background: '#f8fafc',
                            }}>
                              <span style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: GOWRI_COLORS[gowriSlot.type?.nature]?.dot || '#94a3b8',
                              }} />
                              {t ? gowriSlot.type?.tamil : gowriSlot.type?.label}
                            </span>
                          )}
                          {warnings.map(w => {
                            const sl = SPECIAL_LABELS[w];
                            return sl ? (
                              <span key={w} style={{
                                padding: '1px 4px', borderRadius: 3, fontSize: 6.5,
                                fontWeight: 800, color: sl.color, background: sl.bg,
                              }}>
                                {t ? sl.ta : sl.en}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>

                    {/* Direction */}
                    <td style={tdStyle}>
                      {s.direction && (
                        <span style={{
                          padding: '2px 6px', borderRadius: 4, fontSize: 7.5, fontWeight: 700,
                          background: '#eef2ff', color: '#4f46e5',
                        }}>
                          {n(s.direction, lang)}
                        </span>
                      )}
                    </td>

                    {/* Palan */}
                    <td style={{ ...tdStyle, fontSize: 7.5, color: '#475569', lineHeight: 1.4 }}>
                      {s.palan || '—'}
                    </td>

                    {/* Strength */}
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 900, fontSize: 9, color: strengthColor }}>
                      {s.strength}%
                    </td>
                  </tr>

                  {/* ── Sub-table (Sookshima) ───────────── */}
                  {showSubTable && (
                    <tr style={{ background: '#fffbeb' }}>
                      <td colSpan={8} style={{ padding: '0 6px 0 24px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ borderLeft: '2px solid #fbbf24', paddingLeft: 10, margin: '4px 0' }}>
                          <div style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d97706', marginBottom: 3 }}>
                            {labels.sookshima}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
                            <thead>
                              <tr style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                                <th style={{ padding: '2px 6px', width: 65, textAlign: 'left' }}>{labels.bird}</th>
                                <th style={{ padding: '2px 6px', width: 55, textAlign: 'left' }}>{labels.activity}</th>
                                <th style={{ padding: '2px 6px', width: 45, textAlign: 'left' }}>{labels.relation}</th>
                                <th style={{ padding: '2px 6px', textAlign: 'left' }}>{labels.time}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSookshimaSlots(yama.subRows, i, s.start, s.end).map((sk, j) => {
                                const skHora = getHorai(sk.start, sk.end, horai);
                                const skGowri = getGowri(sk.start, sk.end, gowri);
                                const skWarnings = getSpecialWarnings(sk.start, sk.end, specialPeriods);
                                return (
                                  <tr key={j} style={{ borderTop: '1px solid #fef3c7' }}>
                                    <td style={{ padding: '3px 6px', fontWeight: 800, color: '#1e293b', fontSize: 8 }}>
                                      {n(sk.bird, lang)}
                                    </td>
                                    <td style={{ padding: '3px 6px' }}>
                                      {sk.activity && (() => {
                                        const ac = ACTIVITY_COLORS[sk.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                                        return (
                                          <span style={{
                                            padding: '1px 5px', borderRadius: 3, fontSize: 7, fontWeight: 800,
                                            background: ac.bg, color: ac.text,
                                          }}>
                                            {n(sk.activity, lang)}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                    <td style={{ padding: '3px 6px', fontSize: 7.5, fontWeight: 700, color: '#475569' }}>
                                      {n(sk.relation, lang)}
                                    </td>
                                    <td style={{ padding: '3px 6px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 7.5, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
                                          {sk.startLabel} – {sk.endLabel}
                                        </span>
                                        {skHora && (
                                          <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 2,
                                            padding: '1px 3px', borderRadius: 2, fontSize: 6.5, fontWeight: 800,
                                            background: '#f1f5f9', color: '#475569',
                                          }}>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: PLANET_DOTS[skHora.planet?.key] || '#94a3b8' }} />
                                            {t ? skHora.planet?.tamil : skHora.planet?.label}
                                          </span>
                                        )}
                                        {skGowri && (
                                          <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 2,
                                            padding: '1px 3px', borderRadius: 2, fontSize: 6.5, fontWeight: 800,
                                            color: GOWRI_COLORS[skGowri.type?.nature]?.text || '#475569',
                                          }}>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: GOWRI_COLORS[skGowri.type?.nature]?.dot || '#94a3b8' }} />
                                            {t ? skGowri.type?.tamil : skGowri.type?.label}
                                          </span>
                                        )}
                                        {skWarnings.map(w => {
                                          const sl = SPECIAL_LABELS[w];
                                          return sl ? (
                                            <span key={w} style={{
                                              padding: '1px 3px', borderRadius: 2, fontSize: 6, fontWeight: 800,
                                              color: sl.color, background: sl.bg,
                                            }}>
                                              {t ? sl.ta : sl.en}
                                            </span>
                                          ) : null;
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Horai Block ────────────────────────────────────────────── */
function HoraiBlock({ title, items, lang, font }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, fontFamily: font }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5, fontFamily: font }}>
        <thead>
          <tr>
            <th style={{ width: 25, padding: '3px 5px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>#</th>
            <th style={{ padding: '3px 5px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', textAlign: 'left' }}>{lang === 'ta' ? 'கிரகம்' : 'Planet'}</th>
            <th style={{ padding: '3px 5px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', textAlign: 'left' }}>{lang === 'ta' ? 'நேரம்' : 'Time'}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h, i) => (
            <tr key={h.index} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '3px 5px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#94a3b8' }}>{h.index}</td>
              <td style={{ padding: '3px 5px', border: '1px solid #e2e8f0', fontWeight: 800 }}>{n(h.planet, lang)}</td>
              <td style={{ padding: '3px 5px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: 8, color: '#64748b', whiteSpace: 'nowrap' }}>
                {h.startLabel} – {h.endLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Gowri Block ────────────────────────────────────────────── */
function GowriBlock({ title, items, lang, font }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, fontFamily: font }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5, fontFamily: font }}>
        <thead>
          <tr>
            <th style={{ width: 25, padding: '3px 5px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>#</th>
            <th style={{ padding: '3px 5px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', color: '#475569', textAlign: 'left' }}>{lang === 'ta' ? 'வகை' : 'Type'}</th>
            <th style={{ width: 25, padding: '3px 5px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', color: '#475569', textAlign: 'center' }}>{lang === 'ta' ? 'தன்மை' : 'Nature'}</th>
            <th style={{ padding: '3px 5px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 7, fontWeight: 800, textTransform: 'uppercase', color: '#475569', textAlign: 'left' }}>{lang === 'ta' ? 'நேரம்' : 'Time'}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((g, i) => {
            const isGood = g.type.nature === 'good';
            return (
              <tr key={g.index} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '3px 5px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#94a3b8' }}>{g.index}</td>
                <td style={{ padding: '3px 5px', border: '1px solid #e2e8f0', fontWeight: 800, color: isGood ? '#059669' : '#dc2626' }}>
                  {n(g.type, lang)}
                </td>
                <td style={{ padding: '3px 5px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 900, color: isGood ? '#059669' : '#dc2626', fontSize: 10 }}>
                  {isGood ? '✓' : '✗'}
                </td>
                <td style={{ padding: '3px 5px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: 8, color: '#64748b', whiteSpace: 'nowrap' }}>
                  {g.startLabel} – {g.endLabel}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
