import React from 'react';

/* ── helpers ─────────────────────────────────────────────────── */
function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

function fmtDate(d, lang) {
  return new Date(d).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

const FONT = 'Inter, "Noto Sans Tamil", sans-serif';

const ACT = {
  ruling:   { bg: '#fef3c7', text: '#92400e' },
  eating:   { bg: '#d1fae5', text: '#065f46' },
  walking:  { bg: '#dbeafe', text: '#1e40af' },
  sleeping: { bg: '#ede9fe', text: '#5b21b6' },
  dying:    { bg: '#ffe4e6', text: '#9f1239' },
};

const PLANET_DOT = {
  sun: '#f59e0b', moon: '#6366f1', mars: '#ef4444',
  mercury: '#22c55e', jupiter: '#f97316', venus: '#ec4899', saturn: '#334155',
};

const GOWRI_C = {
  good: { dot: '#059669', text: '#065f46' },
  bad:  { dot: '#dc2626', text: '#991b1b' },
};

const SPECIAL_LBL = {
  rahu:       { ta: 'ராகு',    en: 'Rahu', color: '#9f1239', bg: '#ffe4e6' },
  yamagandam: { ta: 'எமகண்டம்', en: 'Yama', color: '#92400e', bg: '#fef3c7' },
  kulikai:    { ta: 'குளிகன்', en: 'Kuli', color: '#5b21b6', bg: '#ede9fe' },
};

function getHorai(start, end, list) {
  if (!list?.length) return null;
  const mid = (new Date(start).getTime() + new Date(end).getTime()) / 2;
  return list.find(h => mid >= new Date(h.start).getTime() && mid < new Date(h.end).getTime()) || null;
}

function getGowri(start, end, list) {
  if (!list?.length) return null;
  const mid = (new Date(start).getTime() + new Date(end).getTime()) / 2;
  return list.find(g => mid >= new Date(g.start).getTime() && mid < new Date(g.end).getTime()) || null;
}

function getWarnings(start, end, sp) {
  if (!sp) return [];
  const s = new Date(start).getTime(), e = new Date(end).getTime();
  return ['rahu', 'yamagandam', 'kulikai'].filter(key => {
    const p = sp[key];
    if (!p) return false;
    return new Date(p.start).getTime() < e && new Date(p.end).getTime() > s;
  });
}

function getSookshima(subRows, idx, parentStart, parentEnd) {
  const s0 = new Date(parentStart).getTime();
  const dur = (new Date(parentEnd).getTime() - s0) / 5;
  return [...subRows.slice(idx), ...subRows.slice(0, idx)].map((r, i) => {
    const s = s0 + i * dur, e = s + dur;
    return {
      bird: r.bird, activity: r.activity, relation: r.relation,
      start: new Date(s).toISOString(), end: new Date(e).toISOString(),
      startLabel: new Date(s).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      endLabel:   new Date(e).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  });
}

/* ── Shared header / footer ────────────────────────────────────── */
function PrintHeader({ branding, lang, subtitle, right }) {
  const t = lang === 'ta';
  if (!branding) return null;
  const name = t ? (branding.astrologerNameTa || branding.astrologerNameEn || branding.astrologerName)
                 : (branding.astrologerNameEn || branding.astrologerName);
  const company = t ? (branding.companyNameTa || branding.companyNameEn || branding.companyName)
                    : (branding.companyNameEn || branding.companyName);
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: '#0f172a', color: '#fff',
      padding: '8px 12px', marginBottom: 10,
      fontFamily: FONT,
    }}>
      {/* Left: logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={branding.logoUrl || '/logo.png'}
             style={{ height: 38, width: 'auto', objectFit: 'contain', borderRadius: 4, background: '#fff', padding: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{company}</div>
          {subtitle && <div style={{ fontSize: 7.5, color: '#f59e0b', fontWeight: 700, marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      {/* Right: phone + custom */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#f59e0b', letterSpacing: '0.02em' }}>{branding.mobile}</div>
        {right && <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{right}</div>}
      </div>
    </div>
  );
}

function PrintFooter({ branding, lang }) {
  const t = lang === 'ta';
  if (!branding) return null;
  const addr = t ? (branding.addressTa || branding.addressEn || branding.address)
                 : (branding.addressEn || branding.address);
  return (
    <div style={{
      marginTop: 14, borderTop: '1px solid #e2e8f0', paddingTop: 8,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      fontFamily: FONT, fontSize: 8, color: '#475569',
      pageBreakInside: 'avoid',
    }}>
      <div style={{ display: 'flex', gap: 20 }}>
        {branding.mobile && (
          <div><span style={{ fontWeight: 900, color: '#0f172a' }}>{t ? 'தொலை:' : 'Ph:'}</span> {branding.mobile}</div>
        )}
        {branding.whatsapp && (
          <div><span style={{ fontWeight: 900, color: '#0f172a' }}>{t ? 'WA:' : 'WA:'}</span> {branding.whatsapp}</div>
        )}
        {branding.website && (
          <div><span style={{ fontWeight: 900, color: '#0f172a' }}>{t ? 'இணையம்:' : 'Web:'}</span> {branding.website}</div>
        )}
        {branding.socialMedia?.map((s, i) => (
          <div key={i}><span style={{ fontWeight: 900, color: '#0f172a' }}>{s.platform}:</span> {s.url}</div>
        ))}
      </div>
      {addr && <div style={{ maxWidth: 200, textAlign: 'right', color: '#64748b' }}>{addr}</div>}
    </div>
  );
}

/* ── Special periods bar ──────────────────────────────────────── */
function SpecialBar({ sp, t }) {
  const items = [
    { label: t ? 'ராகு காலம்' : 'Rahu Kalam',  p: sp?.rahu,       color: '#9f1239', bg: '#fff1f2' },
    { label: t ? 'எமகண்டம்'   : 'Yamagandam',  p: sp?.yamagandam, color: '#92400e', bg: '#fffbeb' },
    { label: t ? 'குளிகன்'   : 'Kulikan',      p: sp?.kulikai,    color: '#5b21b6', bg: '#faf5ff' },
  ].filter(x => x.p);
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', fontFamily: FONT }}>
      {items.map(({ label, p, color, bg }) => (
        <div key={label} style={{ padding: '4px 10px', borderRadius: 4, background: bg, border: `1px solid ${color}30`, fontSize: 8, fontWeight: 800, color }}>
          {label}: <span style={{ fontWeight: 900 }}>{p.startLabel} – {p.endLabel}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Section label ────────────────────────────────────────────── */
function SLabel({ children, color = '#0f172a' }) {
  return (
    <div style={{
      fontSize: 7.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
      color: '#fff', background: color, padding: '3px 8px', display: 'inline-block',
      borderRadius: 3, marginBottom: 5, fontFamily: FONT,
    }}>{children}</div>
  );
}

/* ── Schedule table ───────────────────────────────────────────── */
function ScheduleBlock({ title, yamas, lang, horai, gowri, sp, titleColor, showSubTable }) {
  if (!yamas?.length) return null;
  const t = lang === 'ta';
  const labels = {
    yama: t ? 'ஜாமம்' : 'Yama', bird: t ? 'பட்சி' : 'Bird',
    activity: t ? 'தொழில்' : 'Activity', relation: t ? 'உறவு' : 'Relation',
    time: t ? 'நேரம்' : 'Time', direction: t ? 'திசை' : 'Direction',
    palan: t ? 'பலன்' : 'Palan', strength: t ? 'பலம்' : 'Strength',
    sookshima: t ? 'அதி சூட்சும விவரம்' : 'Sookshima',
  };

  const TH = { padding: '5px 6px', fontSize: 7.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', background: titleColor, textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.15)' };
  const TD = { padding: '4px 6px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', verticalAlign: 'top', fontFamily: FONT };

  return (
    <div style={{ marginBottom: 12 }}>
      <SLabel color={titleColor}>{title}</SLabel>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 8.5 }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: 72 }}>{labels.yama}</th>
            <th style={{ ...TH, width: 52 }}>{labels.bird}</th>
            <th style={{ ...TH, width: 54 }}>{labels.activity}</th>
            <th style={{ ...TH, width: 42 }}>{labels.relation}</th>
            <th style={{ ...TH, width: 115 }}>{labels.time}</th>
            <th style={{ ...TH, width: 50 }}>{labels.direction}</th>
            <th style={TH}>{labels.palan}</th>
            <th style={{ ...TH, width: 36, textAlign: 'right' }}>{labels.strength}</th>
          </tr>
        </thead>
        {yamas.map(yama => (
          <tbody key={yama.index} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            {yama.subRows.map((s, i) => {
              const hora = getHorai(s.start, s.end, horai);
              const gowriSlot = getGowri(s.start, s.end, gowri);
              const warns = getWarnings(s.start, s.end, sp);
              const isFirst = i === 0;
              const str = Number(s.strength);
              const strColor = str >= 60 ? '#059669' : str >= 30 ? '#b45309' : '#dc2626';
              const rowBg = i % 2 === 0 ? '#fff' : '#f8fafc';
              return (
                <React.Fragment key={`${yama.index}-${i}`}>
                  <tr style={{ background: rowBg, borderTop: isFirst ? `2px solid ${titleColor}` : undefined }}>
                    {/* Yama */}
                    <td style={{ ...TD, borderLeft: `3px solid ${titleColor}` }}>
                      {isFirst && (
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 11, color: titleColor, lineHeight: 1 }}>
                            {t ? 'ஜாமம்' : 'Jamam'} {yama.index}
                          </div>
                          <div style={{ fontSize: 7.5, color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap', marginTop: 2 }}>
                            {yama.startLabel} – {yama.endLabel}
                          </div>
                          {yama.mainActivity && (
                            <div style={{ fontSize: 7.5, color: '#1e293b', fontWeight: 900, marginTop: 2, textTransform: 'uppercase' }}>
                              {n(yama.mainActivity, lang)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    {/* Bird */}
                    <td style={{ ...TD, fontWeight: 900, color: '#0f172a', fontSize: 9 }}>{n(s.bird, lang)}</td>
                    {/* Activity */}
                    <td style={TD}>
                      {s.activity && (() => {
                        const ac = ACT[s.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                        return <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900, background: ac.bg, color: ac.text, whiteSpace: 'nowrap', display: 'inline-block' }}>{n(s.activity, lang)}</span>;
                      })()}
                    </td>
                    {/* Relation */}
                    <td style={{ ...TD, fontWeight: 700, color: '#475569', fontSize: 8.5 }}>{n(s.relation, lang)}</td>
                    {/* Time + badges */}
                    <td style={TD}>
                      <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', fontSize: 9 }}>{s.startLabel} – {s.endLabel}</div>
                      {(hora || gowriSlot || warns.length > 0) && (
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
                          {hora && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 5px', borderRadius: 3, fontSize: 7.5, fontWeight: 800, background: '#f1f5f9', color: '#334155' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: PLANET_DOT[hora.planet?.key] || '#94a3b8', flexShrink: 0 }} />
                              {t ? hora.planet?.tamil : hora.planet?.label}
                            </span>
                          )}
                          {gowriSlot && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 5px', borderRadius: 3, fontSize: 7.5, fontWeight: 800, color: GOWRI_C[gowriSlot.type?.nature]?.text || '#475569', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOWRI_C[gowriSlot.type?.nature]?.dot || '#94a3b8', flexShrink: 0 }} />
                              {t ? gowriSlot.type?.tamil : gowriSlot.type?.label}
                            </span>
                          )}
                          {warns.map(w => {
                            const sl = SPECIAL_LBL[w];
                            return sl ? <span key={w} style={{ padding: '1px 5px', borderRadius: 3, fontSize: 7, fontWeight: 900, color: sl.color, background: sl.bg }}>{t ? sl.ta : sl.en}</span> : null;
                          })}
                        </div>
                      )}
                    </td>
                    {/* Direction */}
                    <td style={TD}>
                      {s.direction && <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 800, background: '#eef2ff', color: '#4338ca', display: 'inline-block' }}>{n(s.direction, lang)}</span>}
                    </td>
                    {/* Palan */}
                    <td style={{ ...TD, fontSize: 8, color: '#475569', lineHeight: 1.4 }}>{s.palan || '—'}</td>
                    {/* Strength */}
                    <td style={{ ...TD, textAlign: 'right', fontWeight: 900, fontSize: 10, color: strColor }}>{s.strength}%</td>
                  </tr>

                  {/* Sookshima sub-table */}
                  {showSubTable && (
                    <tr style={{ background: '#fffbeb' }}>
                      <td colSpan={8} style={{ padding: '0 6px 0 24px', borderBottom: '1px solid #e2e8f0', borderLeft: `3px solid ${titleColor}` }}>
                        <div style={{ borderLeft: '2px solid #fbbf24', paddingLeft: 8, margin: '6px 0' }}>
                          <div style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#92400e', marginBottom: 4 }}>{labels.sookshima}</div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
                            <thead>
                              <tr>
                                {[labels.bird, labels.activity, labels.relation, labels.time].map(h => (
                                  <th key={h} style={{ padding: '3px 6px', fontSize: 7, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid #fde68a' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {getSookshima(yama.subRows, i, s.start, s.end).map((sk, j) => {
                                const skH = getHorai(sk.start, sk.end, horai);
                                const skG = getGowri(sk.start, sk.end, gowri);
                                return (
                                  <tr key={j} style={{ borderTop: '1px solid #fef3c7' }}>
                                    <td style={{ padding: '3px 6px', fontWeight: 900, color: '#0f172a', fontSize: 8.5 }}>{n(sk.bird, lang)}</td>
                                    <td style={{ padding: '3px 6px' }}>
                                      {sk.activity && (() => {
                                        const ac = ACT[sk.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                                        return <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 7.5, fontWeight: 900, background: ac.bg, color: ac.text }}>{n(sk.activity, lang)}</span>;
                                      })()}
                                    </td>
                                    <td style={{ padding: '3px 6px', fontSize: 8, fontWeight: 700, color: '#475569' }}>{n(sk.relation, lang)}</td>
                                    <td style={{ padding: '3px 6px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 8, fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap' }}>{sk.startLabel} – {sk.endLabel}</span>
                                        {skH && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 4px', borderRadius: 3, fontSize: 7, fontWeight: 800, background: '#f1f5f9', color: '#334155' }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: PLANET_DOT[skH.planet?.key] || '#94a3b8' }} />{t ? skH.planet?.tamil : skH.planet?.label}</span>}
                                        {skG && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 4px', borderRadius: 3, fontSize: 7, fontWeight: 800, color: GOWRI_C[skG.type?.nature]?.text || '#475569' }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: GOWRI_C[skG.type?.nature]?.dot || '#94a3b8' }} />{t ? skG.type?.tamil : skG.type?.label}</span>}
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

/* ── Horai / Gowri mini tables ────────────────────────────────── */
function HoraiBlock({ title, items, lang, color }) {
  const t = lang === 'ta';
  return (
    <div style={{ flex: 1 }}>
      <SLabel color={color}>{title}</SLabel>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 8.5 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['#', t ? 'கிரகம்' : 'Planet', t ? 'நேரம்' : 'Time'].map(h => (
              <th key={h} style={{ padding: '4px 6px', fontSize: 7.5, fontWeight: 900, textTransform: 'uppercase', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((h, i) => (
            <tr key={h.index} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '3px 6px', fontWeight: 700, color: '#94a3b8', width: 20 }}>{h.index}</td>
              <td style={{ padding: '3px 6px', fontWeight: 800 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLANET_DOT[h.planet?.key] || '#94a3b8', flexShrink: 0 }} />
                  {n(h.planet, lang)}
                </span>
              </td>
              <td style={{ padding: '3px 6px', fontSize: 8, color: '#64748b', whiteSpace: 'nowrap' }}>{h.startLabel} – {h.endLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GowriBlock({ title, items, lang, color }) {
  const t = lang === 'ta';
  const isGoodItem = i => i.type?.nature === 'good';
  return (
    <div style={{ flex: 1 }}>
      <SLabel color={color}>{title}</SLabel>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 8.5 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['#', t ? 'வகை' : 'Type', t ? 'நேரம்' : 'Time'].map(h => (
              <th key={h} style={{ padding: '4px 6px', fontSize: 7.5, fontWeight: 900, textTransform: 'uppercase', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((g, i) => {
            const good = isGoodItem(g);
            return (
              <tr key={g.index} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '3px 6px', fontWeight: 700, color: '#94a3b8', width: 20 }}>{g.index}</td>
                <td style={{ padding: '3px 6px', fontWeight: 800, color: good ? '#065f46' : '#991b1b' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: good ? '#059669' : '#dc2626', flexShrink: 0 }} />
                    {n(g.type, lang)}
                  </span>
                </td>
                <td style={{ padding: '3px 6px', fontSize: 8, color: '#64748b', whiteSpace: 'nowrap' }}>{g.startLabel} – {g.endLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────── */
export function PrintView({ prediction, lang, locationName, showSubTable = true, branding }) {
  if (!prediction) return null;

  const t = lang === 'ta';
  const sp = prediction.specialPeriods;
  const horai = prediction.horai || [];
  const gowri = prediction.gowri || [];
  const dayHorai   = horai.filter(h => h.period === 'day');
  const nightHorai = horai.filter(h => h.period === 'night');
  const dayGowri   = gowri.filter(g => g.period === 'day');
  const nightGowri = gowri.filter(g => g.period === 'night');

  const dateStr = fmtDate(prediction.date, lang);

  return (
    <div id="print-view" style={{
      visibility: 'hidden',
      position: 'absolute',
      top: 0, left: 0,
      width: '210mm',
      fontFamily: FONT,
      color: '#0f172a',
      background: '#fff',
      fontSize: 8.5,
      lineHeight: 1.35,
    }}>
      <style>{`
        @media print {
          @page { margin: 4mm; size: A4; }
          body { margin: 0; padding: 0; }
          #print-view { visibility: visible !important; position: static !important; width: 100% !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      {/* PAGE 1 — Header + special periods + day schedule */}
      <PrintHeader branding={branding} lang={lang}
        subtitle={t ? `தேதி: ${dateStr}` : `Date: ${dateStr}`}
        right={locationName}
      />

      <SpecialBar sp={sp} t={t} />

      <ScheduleBlock
        title={t ? 'பகல் அட்டவணை' : 'Day Schedule'}
        yamas={prediction.dayYamas} lang={lang}
        horai={horai} gowri={gowri} sp={sp}
        titleColor="#b45309" showSubTable={showSubTable}
      />

      {/* PAGE 2 — Night schedule */}
      <div className="page-break" />
      <PrintHeader branding={branding} lang={lang}
        subtitle={t ? `தேதி: ${dateStr}` : `Date: ${dateStr}`}
        right={locationName}
      />

      <ScheduleBlock
        title={t ? 'இரவு அட்டவணை' : 'Night Schedule'}
        yamas={prediction.nightYamas} lang={lang}
        horai={horai} gowri={gowri} sp={sp}
        titleColor="#4338ca" showSubTable={showSubTable}
      />

      {/* PAGE 3 — Horai + Gowri */}
      <div className="page-break" />
      <PrintHeader branding={branding} lang={lang}
        subtitle={t ? `தேதி: ${dateStr}` : `Date: ${dateStr}`}
        right={locationName}
      />

      <div style={{ marginBottom: 12 }}>
        <SLabel color="#b45309">{t ? 'ஹோரை அட்டவணை' : 'Horai Schedule'}</SLabel>
        <div style={{ display: 'flex', gap: 12 }}>
          <HoraiBlock title={t ? 'பகல் ஹோரை' : 'Day Horai'}   items={dayHorai}   lang={lang} color="#b45309" />
          <HoraiBlock title={t ? 'இரவு ஹோரை' : 'Night Horai'} items={nightHorai} lang={lang} color="#4338ca" />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <SLabel color="#065f46">{t ? 'கௌரி பஞ்சாங்கம்' : 'Gowri Panchangam'}</SLabel>
        <div style={{ display: 'flex', gap: 12 }}>
          <GowriBlock title={t ? 'பகல் கௌரி' : 'Day Gowri'}   items={dayGowri}   lang={lang} color="#065f46" />
          <GowriBlock title={t ? 'இரவு கௌரி' : 'Night Gowri'} items={nightGowri} lang={lang} color="#1e40af" />
        </div>
      </div>

      <PrintFooter branding={branding} lang={lang} />
    </div>
  );
}
