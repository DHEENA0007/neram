import React from 'react';

function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

function fmtDate(d, lang) {
  return new Date(d + 'T00:00:00').toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
function fmtDateShort(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

/* ── shared print primitives + styling ───────────────── */
const baseFont = { fontFamily: 'Inter, "Noto Sans Tamil", sans-serif' };

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
  sun:     '#f59e0b', moon:    '#6366f1', mars:    '#ef4444',
  mercury: '#22c55e', jupiter: '#f97316', venus:   '#ec4899', saturn:  '#1e293b',
};

const SPECIAL_LABELS = {
  rahu:       { ta: 'ராகு',   en: 'Rahu',   color: '#be123c', bg: '#ffe4e6' },
  yamagandam: { ta: 'எமகண்டம்', en: 'Yama',  color: '#b45309', bg: '#fef3c7' },
  kulikai:    { ta: 'குளிகன்', en: 'Kuli',   color: '#6d28d9', bg: '#ede9fe' },
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
      bird: row.bird, activity: row.activity, relation: row.relation,
      start: new Date(s).toISOString(), end: new Date(e).toISOString(),
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

function Tbl({ children, style }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5, ...baseFont, ...style }}>
      {children}
    </table>
  );
}

function SectionBreak() {
  return <div style={{ pageBreakBefore: 'always', marginTop: 0 }} />;
}

function PageHeader({ title, fromDate, toDate, locationName, lang, branding }) {
  const tl = lang === 'ta';
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      paddingBottom: 25, 
      marginBottom: 20, 
      borderBottom: '3px solid #0f172a',
      ...baseFont
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src={branding?.logoUrl || '/logo.png'} style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
        <div>
           <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1 }}>
             {tl ? (branding?.astrologerNameTa || branding?.astrologerNameEn || branding?.astrologerName) : (branding?.astrologerNameEn || branding?.astrologerName)}
           </h1>
           <h2 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0 0' }}>
             {tl ? (branding?.companyNameTa || branding?.companyNameEn || branding?.companyName) : (branding?.companyNameEn || branding?.companyName)}
           </h2>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
           Exported Location: <span style={{ color: '#64748b', fontWeight: 800 }}>{locationName}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
           {branding?.mobile}
        </div>
      </div>
    </div>
  );
}

function SectionTag({ children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ background: '#1e293b', color: '#fff', padding: '4px 10px', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', borderRadius: 3, ...baseFont }}>
        {children}
      </div>
    </div>
  );
}

/* ── Full Formatted Schedule Block (matching PrintView) ── */
function DetailedScheduleBlock({ title, yamas, lang, labels, horai, gowri, specialPeriods, titleColor, showSubTable }) {
  if (!yamas?.length) return null;
  const t = lang === 'ta';

  const thStyle = {
    padding: '8px 8px', fontSize: 8.5, fontWeight: 900, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#1e293b', background: '#f8fafc',
    borderBottom: '2px solid #0f172a', borderRight: '1px solid #e2e8f0', textAlign: 'left',
  };
  const tdStyle = { padding: '6px 8px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', verticalAlign: 'top', fontSize: 9 };

  return (
    <div style={{ marginBottom: 16, pageBreakInside: 'avoid' }}>
      <SectionTag>{title}</SectionTag>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...baseFont }}>
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
        {yamas.map((yama) => (
          <tbody key={yama.index} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            {yama.subRows.map((s, i) => {
              const hora = getHorai(s.start, s.end, horai);
              const gowriSlot = getGowri(s.start, s.end, gowri);
              const warnings = getSpecialWarnings(s.start, s.end, specialPeriods);
              const isFirst = i === 0;
              const strengthNum = Number(s.strength);
              const strengthColor = strengthNum >= 60 ? '#059669' : strengthNum >= 30 ? '#b45309' : '#dc2626';

              return (
                <React.Fragment key={`${yama.index}-${i}`}>
                  <tr style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: isFirst ? '2px solid #0f172a' : undefined }}>
                    <td style={{ ...tdStyle, borderLeft: '1px solid #f1f5f9' }}>
                      {isFirst && (
                        <div style={{ minWidth: 80 }}>
                          <div style={{ fontWeight: 900, fontSize: 13, color: titleColor, lineHeight: 1 }}>
                            {t ? 'ஜாமம்' : 'Jamam'} {yama.index}
                          </div>
                          <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 800, whiteSpace: 'nowrap', marginTop: 4 }}>
                            {yama.startLabel} – {yama.endLabel}
                          </div>
                          {yama.mainActivity && (
                            <div style={{ fontSize: 8, color: '#1e293b', fontWeight: 900, marginTop: 4, textTransform: 'uppercase' }}>{n(yama.mainActivity, lang)}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 900, color: '#0f172a', fontSize: 10 }}>{n(s.bird, lang)}</td>
                    <td style={tdStyle}>
                      {s.activity && (() => {
                        const ac = ACTIVITY_COLORS[s.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                        return (
                          <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, background: ac.bg, color: ac.text, whiteSpace: 'nowrap', display: 'inline-block' }}>
                            {n(s.activity, lang)}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#334155', fontSize: 9.5 }}>{n(s.relation, lang)}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', fontSize: 9.5 }}>
                        {s.startLabel} – {s.endLabel}
                      </div>
                      {(hora || gowriSlot || warnings.length > 0) && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                          {hora && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900, background: '#f1f5f9', color: '#1e293b' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLANET_DOTS[hora.planet?.key] || '#94a3b8' }} />
                              {t ? hora.planet?.tamil : hora.planet?.label}
                            </span>
                          )}
                          {gowriSlot && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900, color: GOWRI_COLORS[gowriSlot.type?.nature]?.text || '#475569', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOWRI_COLORS[gowriSlot.type?.nature]?.dot || '#94a3b8' }} />
                              {t ? gowriSlot.type?.tamil : gowriSlot.type?.label}
                            </span>
                          )}
                          {warnings.map(w => {
                            const sl = SPECIAL_LABELS[w];
                            return sl ? <span key={w} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 7.5, fontWeight: 900, color: sl.color, background: sl.bg }}>{t ? sl.ta : sl.en}</span> : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {s.direction && <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, background: '#eef2ff', color: '#4f46e5', display: 'inline-block' }}>{n(s.direction, lang)}</span>}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 9, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>{s.palan || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 900, fontSize: 11, color: strengthColor }}>{s.strength}%</td>
                  </tr>
 
                  {/* Sookshima */}
                  {showSubTable && (
                    <tr style={{ background: '#fffcf0' }}>
                      <td colSpan={8} style={{ padding: '0 8px 0 32px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9' }}>
                        <div style={{ borderLeft: '3px solid #fbbf24', paddingLeft: 12, margin: '8px 0' }}>
                          <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#b45309', marginBottom: 6 }}>
                            {labels.sookshima}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', ...baseFont }}>
                            <thead>
                              <tr style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                                <th style={{ padding: '4px 8px', width: 80, textAlign: 'left', borderBottom: '1px solid #fdf2f2' }}>{labels.bird}</th>
                                <th style={{ padding: '4px 8px', width: 70, textAlign: 'left', borderBottom: '1px solid #fdf2f2' }}>{labels.activity}</th>
                                <th style={{ padding: '4px 8px', width: 60, textAlign: 'left', borderBottom: '1px solid #fdf2f2' }}>{labels.relation}</th>
                                <th style={{ padding: '4px 8px', textAlign: 'left', borderBottom: '1px solid #fdf2f2' }}>{labels.time}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSookshimaSlots(yama.subRows, i, s.start, s.end).map((sk, j) => {
                                const skHora = getHorai(sk.start, sk.end, horai);
                                const skGowri = getGowri(sk.start, sk.end, gowri);
                                const skWarnings = getSpecialWarnings(sk.start, sk.end, specialPeriods);
                                return (
                                  <tr key={j} style={{ borderTop: '1px solid #fef3c7' }}>
                                    <td style={{ padding: '5px 8px', fontWeight: 900, color: '#0f172a', fontSize: 9 }}>{n(sk.bird, lang)}</td>
                                    <td style={{ padding: '5px 8px' }}>
                                      {sk.activity && (() => {
                                        const ac = ACTIVITY_COLORS[sk.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                                        return <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900, background: ac.bg, color: ac.text }}>{n(sk.activity, lang)}</span>;
                                      })()}
                                    </td>
                                    <td style={{ padding: '5px 8px', fontSize: 8.5, fontWeight: 800, color: '#475569' }}>{n(sk.relation, lang)}</td>
                                    <td style={{ padding: '5px 8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap' }}>{sk.startLabel} – {sk.endLabel}</span>
                                        {skHora && (
                                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 5px', borderRadius: 4, fontSize: 7.5, fontWeight: 900, background: '#f1f5f9', color: '#1e293b' }}>
                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: PLANET_DOTS[skHora.planet?.key] || '#94a3b8' }} />{t ? skHora.planet?.tamil : skHora.planet?.label}
                                          </span>
                                        )}
                                        {skGowri && (
                                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 5px', borderRadius: 4, fontSize: 7.5, fontWeight: 900, color: GOWRI_COLORS[skGowri.type?.nature]?.text || '#475569' }}>
                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOWRI_COLORS[skGowri.type?.nature]?.dot || '#94a3b8' }} />{t ? skGowri.type?.tamil : skGowri.type?.label}
                                          </span>
                                        )}
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
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

/* ── Special Periods Table ───────── */
function SpecialPeriodsSection({ days, categories, lang, fromDate, toDate, locationName }) {
  const tl = lang === 'ta';
  const showRahu = categories.includes('rahu');
  const showYama = categories.includes('yama');
  const showKuli = categories.includes('kuli');
  if (!showRahu && !showYama && !showKuli) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* PageHeader removed as requested */}
      <Tbl>
        <thead>
          <tr>
            <th style={{ background: '#1e293b', color: '#fff', padding: '6px 8px', fontWeight: 800, fontSize: 8, textAlign: 'left', width: 60 }}>{tl ? 'தேதி' : 'Date'}</th>
            <th style={{ background: '#1e293b', color: '#fff', padding: '6px 8px', fontWeight: 800, fontSize: 8, textAlign: 'left', width: 55 }}>{tl ? 'கிழமை' : 'Day'}</th>
            <th style={{ background: '#fffbeb', color: '#b45309', padding: '6px 8px', fontWeight: 800, fontSize: 8, textAlign: 'left', width: 70 }}>{tl ? 'பகல் பிறை / இரவு பிறை' : 'Day / Night Paksha'}</th>
            {showRahu && <th style={{ background: '#1e293b', color: '#fca5a5', padding: '6px 8px', fontWeight: 800, fontSize: 8, textAlign: 'left' }}>{tl ? 'ராகு காலம்' : 'Rahu Kalam'}</th>}
            {showYama && <th style={{ background: '#1e293b', color: '#fdba74', padding: '6px 8px', fontWeight: 800, fontSize: 8, textAlign: 'left' }}>{tl ? 'எமகண்டம்' : 'Yamagandam'}</th>}
            {showKuli && <th style={{ background: '#1e293b', color: '#d8b4fe', padding: '6px 8px', fontWeight: 800, fontSize: 8, textAlign: 'left' }}>{tl ? 'குளிகன்' : 'Kulikan'}</th>}
          </tr>
        </thead>
        <tbody>
          {days.map((day, idx) => {
            const sp = day.specialPeriods;
            const bg = idx % 2 === 0 ? '#fff' : '#f8fafc';
            return (
              <tr key={day.date} style={{ background: bg, borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '5px 8px', fontWeight: 800, whiteSpace: 'nowrap' }}>{fmtDateShort(day.date)}</td>
                <td style={{ padding: '5px 8px', fontWeight: 600 }}>{n(day.weekday, lang)}</td>
                <td style={{ padding: '5px 8px', fontSize: 7, fontWeight: 700, color: '#92400e', background: '#fefce8' }}>
                  {n(day.paksha?.day, lang)} / {n(day.paksha?.night, lang)}
                </td>
                {showRahu && (
                  <td style={{ padding: '5px 8px', color: '#be123c', fontWeight: 800, whiteSpace: 'nowrap' }}>{sp?.rahu ? `${sp.rahu.startLabel} – ${sp.rahu.endLabel}` : '—'}</td>
                )}
                {showYama && (
                  <td style={{ padding: '5px 8px', color: '#b45309', fontWeight: 800, whiteSpace: 'nowrap' }}>{sp?.yamagandam ? `${sp.yamagandam.startLabel} – ${sp.yamagandam.endLabel}` : '—'}</td>
                )}
                {showKuli && (
                  <td style={{ padding: '5px 8px', color: '#6d28d9', fontWeight: 800, whiteSpace: 'nowrap' }}>{sp?.kulikai ? `${sp.kulikai.startLabel} – ${sp.kulikai.endLabel}` : '—'}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Tbl>
    </div>
  );
}

/* ── Horai Section ────────────────────────────────────── */
function HoraiSection({ days, lang, fromDate, toDate, locationName }) {
  const tl = lang === 'ta';
  return (
    <div style={{ marginBottom: 20 }}>
      {/* PageHeader removed as requested */}
      {days.map((day, di) => (
        <div key={day.date} style={{ marginBottom: 16, pageBreakInside: 'avoid' }}>
          <div style={{ background: '#f8fafc', borderLeft: '3px solid #64748b', padding: '6px 12px', fontSize: 10, fontWeight: 900, color: '#334155', marginBottom: 8, ...baseFont }}>
            {fmtDate(day.date, lang)} <span style={{ color: '#94a3b8', margin: '0 6px' }}>|</span> {n(day.weekday, lang)}
            <span style={{ fontWeight: 600, fontSize: 8, marginLeft: 16, color: '#b45309', background: '#fefce8', padding: '2px 6px', borderRadius: 4 }}>
              {tl ? 'பகல் பிறை:' : 'Day:'} {n(day.paksha?.day, lang)} / {tl ? 'இரவு:' : 'Night:'} {n(day.paksha?.night, lang)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Day horas */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: '#b45309', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em', ...baseFont }}>{tl ? 'பகல் ஹோரை' : 'Day Horai'}</div>
              <Tbl>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: 25, padding: '4px', textAlign: 'center', fontSize: 7, color: '#475569' }}>#</th>
                    <th style={{ padding: '4px', textAlign: 'left', fontSize: 7, color: '#475569' }}>{tl ? 'கிரகம்' : 'Planet'}</th>
                    <th style={{ padding: '4px', textAlign: 'left', fontSize: 7, color: '#475569' }}>{tl ? 'நேரம்' : 'Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(day.horai || []).filter(h => h.period === 'day').map((h, i) => (
                    <tr key={h.index} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '4px', textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>{h.index}</td>
                      <td style={{ padding: '4px', fontWeight: 800 }}>{n(h.planet, lang)}</td>
                      <td style={{ padding: '4px', fontFamily: 'monospace', color: '#64748b', fontSize: 8 }}>{h.startLabel} – {h.endLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </Tbl>
            </div>
            {/* Night horas */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: '#4f46e5', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em', ...baseFont }}>{tl ? 'இரவு ஹோரை' : 'Night Horai'}</div>
              <Tbl>
                <thead>
                  <tr style={{ background: '#eef2ff' }}>
                    <th style={{ width: 25, padding: '4px', textAlign: 'center', fontSize: 7, color: '#3730a3' }}>#</th>
                    <th style={{ padding: '4px', textAlign: 'left', fontSize: 7, color: '#3730a3' }}>{tl ? 'கிரகம்' : 'Planet'}</th>
                    <th style={{ padding: '4px', textAlign: 'left', fontSize: 7, color: '#3730a3' }}>{tl ? 'நேரம்' : 'Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(day.horai || []).filter(h => h.period === 'night').map((h, i) => (
                    <tr key={h.index} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '4px', textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>{h.index}</td>
                      <td style={{ padding: '4px', fontWeight: 800 }}>{n(h.planet, lang)}</td>
                      <td style={{ padding: '4px', fontFamily: 'monospace', color: '#64748b', fontSize: 8 }}>{h.startLabel} – {h.endLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </Tbl>
            </div>
          </div>
          {di < days.length - 1 && di % 3 === 2 && <SectionBreak />}
        </div>
      ))}
    </div>
  );
}

/* ── Full Schedule Section ────────────────────────────── */
function ScheduleSection({ days, lang, fromDate, toDate, locationName, showSubTable }) {
  const tl = lang === 'ta';
  const labels = {
    yama: tl ? 'ஜாமம்' : 'Yama', bird: tl ? 'பட்சி' : 'Bird', activity: tl ? 'தொழில்' : 'Activity',
    relation: tl ? 'உறவு' : 'Relation', time: tl ? 'நேரம்' : 'Time', direction: tl ? 'திசை' : 'Direction',
    palan: tl ? 'பலன்' : 'Palan', strength: tl ? 'பலம்' : 'Strength', sookshima: tl ? 'அதி சூட்சும விவரம்' : 'Sookshima Breakdown',
  };

  return (
    <div>
      {/* PageHeader removed as requested */}
      {days.map((day, di) => (
        <div key={day.date} style={{ marginBottom: 24, pageBreakInside: 'avoid' }}>
          
          {/* Day Header */}
          <div style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', fontSize: 12, fontWeight: 900, marginBottom: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...baseFont }}>
            <div>
              {fmtDate(day.date, lang)} — {n(day.weekday, lang)}
            </div>
            <div style={{ fontWeight: 700, fontSize: 8, color: '#fefce8', background: '#b45309', padding: '3px 10px', borderRadius: 4 }}>
              {tl ? 'பகல் பிறை:' : 'Day:'} {n(day.paksha?.day, lang)} <span style={{ margin: '0 6px', opacity: 0.5 }}>|</span> {tl ? 'இரவு பிறை:' : 'Night:'} {n(day.paksha?.night, lang)}
            </div>
          </div>

          <DetailedScheduleBlock
            title={`${tl ? 'பகல் அட்டவணை' : 'Day Schedule'}`}
            yamas={day.dayYamas} lang={lang} labels={labels} horai={day.horai} gowri={day.gowri} specialPeriods={day.specialPeriods} titleColor="#b45309" showSubTable={showSubTable}
          />

          <div style={{ height: 8 }} />

          <DetailedScheduleBlock
            title={`${tl ? 'இரவு அட்டவணை' : 'Night Schedule'}`}
            yamas={day.nightYamas} lang={lang} labels={labels} horai={day.horai} gowri={day.gowri} specialPeriods={day.specialPeriods} titleColor="#4f46e5" showSubTable={showSubTable}
          />

          {di < days.length - 1 && <SectionBreak />}
        </div>
      ))}
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────── */
export function RangePrintView({ rangeData, categories, lang, locationName, fromDate, toDate, showSubTable = true, branding }) {
  if (!rangeData?.days?.length) return null;

  const tl = lang === 'ta';
  const days = rangeData.days;
  const hasSpecial  = categories.some(c => ['rahu', 'yama', 'kuli'].includes(c));
  const hasHorai    = categories.includes('horai');
  const hasSchedule = categories.includes('schedule');

  return (
    <div id="range-print-view" style={{
      visibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      fontFamily: 'Inter, "Noto Sans Tamil", sans-serif',
      background: '#fff',
      padding: '10px 20px',
      color: '#0f172a',
      fontSize: 8.5,
      lineHeight: 1.35,
    }}>
      <style>{`
        @media print {
          @page { margin: 3.5mm; size: A4; }
          body { margin: 0; padding: 0; overflow: visible; }
          #range-print-view { padding: 0.6cm !important; width: 100%; box-sizing: border-box; display: block !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      {branding && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          paddingBottom: 20, 
          marginBottom: 15, 
          borderBottom: '3px solid #0f172a',
          pageBreakAfter: 'avoid',
          ...baseFont
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={branding.logoUrl || '/logo.png'} style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
            <div>
               <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1 }}>
                 {tl ? (branding.astrologerNameTa || branding.astrologerNameEn || branding.astrologerName) : (branding.astrologerNameEn || branding.astrologerName)}
               </h1>
               <h2 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0 0' }}>
                 {tl ? (branding.companyNameTa || branding.companyNameEn || branding.companyName) : (branding.companyNameEn || branding.companyName)}
               </h2>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
               Exported Range: <span style={{ color: '#64748b', fontWeight: 800 }}>{fmtDateShort(fromDate)} - {fmtDateShort(toDate)}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
               {branding.mobile}
            </div>
          </div>
        </div>
      )}

      {hasSpecial && (
        <SpecialPeriodsSection
          days={days} categories={categories}
          lang={lang} fromDate={fromDate} toDate={toDate} locationName={locationName}
        />
      )}

      {hasHorai && (
        <>
          {hasSpecial && <SectionBreak />}
          <HoraiSection
            days={days} lang={lang}
            fromDate={fromDate} toDate={toDate} locationName={locationName}
          />
        </>
      )}

      {hasSchedule && (
        <>
          {(hasSpecial || hasHorai) && <SectionBreak />}
          <ScheduleSection
            days={days} lang={lang} showSubTable={showSubTable}
            fromDate={fromDate} toDate={toDate} locationName={locationName}
          />
        </>
      )}

      {/* ── FOOTER ── */}
      {branding && (
        <div style={{ 
          marginTop: 40, 
          paddingTop: 20, 
          borderTop: '2px solid #f1f5f9',
          pageBreakInside: 'avoid',
          ...baseFont
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Contact Details</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>
                {tl ? 'தொலைபேசி:' : 'Phone:'} {branding.mobile}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>
                {tl ? 'வாட்ஸ்அப்:' : 'WhatsApp:'} {branding.whatsapp}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>
                {tl ? 'இணையதளம்:' : 'Website:'} {branding.website}
              </div>
            </div>
            
            {branding.addressEn && (
              <div>
                <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>
                  {tl ? 'முகவரி' : 'Address'}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', maxWidth: 200 }}>
                  {tl ? (branding.addressTa || branding.addressEn || branding.address) : (branding.addressEn || branding.address)}
                </div>
              </div>
            )}
          </div>

          {branding.socialMedia?.length > 0 && (
            <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {branding.socialMedia.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', width: 60 }}>{s.platform}</div>
                  <div style={{ fontSize: 8.5, fontWeight: 800, color: '#6366f1', background: '#f5f3ff', padding: '3px 10px', borderRadius: 6, border: '1px solid #e0e7ff' }}>
                    {s.url}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
