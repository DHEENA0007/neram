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
export function PrintView({ prediction, lang, locationName, showSubTable = true, branding }) {
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
      visibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      fontFamily: font,
      color: '#0f172a',
      background: '#fff',
      padding: '12px 20px',
      fontSize: 8.5,
      lineHeight: 1.35,
    }}>
      <style>{`
        @media print {
          @page { margin: 3.5mm; size: A4; }
          body { margin: 0; padding: 0; overflow: visible; }
          #print-view { padding: 0.6cm !important; width: 100%; box-sizing: border-box; display: block !important; }
          .jamam-section { page-break-inside: avoid; break-inside: avoid; margin-bottom: 20px; }
          .special-period-card { border-bottom: 2px solid currentColor; padding-bottom: 4px; }
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
          pageBreakAfter: 'avoid'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={branding.logoUrl || '/logo.png'} style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
            <div>
               <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1 }}>
                 {t ? (branding.astrologerNameTa || branding.astrologerNameEn || branding.astrologerName) : (branding.astrologerNameEn || branding.astrologerName)}
               </h1>
               <h2 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0 0' }}>
                 {t ? (branding.companyNameTa || branding.companyNameEn || branding.companyName) : (branding.companyNameEn || branding.companyName)}
               </h2>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
               Exported Location: <span style={{ color: '#64748b', fontWeight: 800 }}>{locationName}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
               {branding.mobile}
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE CONTENT ─────────────────────────────────── */}

      {/* ── SPECIAL PERIODS ─────────────────────────────────── */}
      {/* ── SPECIAL PERIODS ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
        {[
          [t ? 'ராகு காலம்' : 'Rahu Kalam', sp?.rahu, '#be123c'],
          [t ? 'எமகண்டம்' : 'Yamagandam', sp?.yamagandam, '#b45309'],
          [t ? 'குளிகன்' : 'Kulikan', sp?.kulikai, '#6d28d9'],
        ].map(([label, p, color]) => (
          <div key={label} className="special-period-card" style={{ color, textAlign: 'center' }}>
            <div style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 900 }}>{p ? `${p.startLabel} – ${p.endLabel}` : '—'}</div>
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

      {/* ── FOOTER ── */}
      {branding && (
        <div style={{ 
          marginTop: 40, 
          paddingTop: 20, 
          borderTop: '2px solid #f1f5f9',
          pageBreakInside: 'avoid'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Contact Details</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>
                {t ? 'தொலைபேசி:' : 'Phone:'} {branding.mobile}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>
                {t ? 'வாட்ஸ்அப்:' : 'WhatsApp:'} {branding.whatsapp}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>
                {t ? 'இணையதளம்:' : 'Website:'} {branding.website}
              </div>
            </div>
            
            {branding.addressEn && (
              <div>
                <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>
                   {t ? 'முகவரி' : 'Address'}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', maxWidth: 200 }}>
                  {t ? (branding.addressTa || branding.addressEn || branding.address) : (branding.addressEn || branding.address)}
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
        {yamas.map((yama) => (
          <tbody key={yama.index} className="jamam-section">
            {/* Group each Jamam to avoid page breaks in the middle of it */}
            {yama.subRows.map((s, i) => {
                const hora = getHorai(s.start, s.end, horai);
                const gowriSlot = getGowri(s.start, s.end, gowri);
                const warnings = getSpecialWarnings(s.start, s.end, specialPeriods);
                const isFirst = i === 0;
                const strengthNum = Number(s.strength);
                const strengthColor = strengthNum >= 60 ? '#059669' : strengthNum >= 30 ? '#b45309' : '#dc2626';

                return (
                  <React.Fragment key={`${yama.index}-${i}`}>
                    <tr className="jamam-section" style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: isFirst ? '2px solid #0f172a' : undefined }}>
                      {/* Yama column */}
                      <td style={{ ...tdStyle, borderLeft: '1px solid #f1f5f9' }}>
                        {isFirst && (
                          <div style={{ minWidth: 80 }}>
                            <div style={{ fontWeight: 900, fontSize: 14, color: titleColor, lineHeight: 1 }}>
                              {t ? 'ஜாமம்' : 'Jamam'} {yama.index}
                            </div>
                            <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 800, whiteSpace: 'nowrap', marginTop: 4 }}>
                              {yama.startLabel} – {yama.endLabel}
                            </div>
                            {yama.mainActivity && (
                              <div style={{ fontSize: 8, color: '#1e293b', fontWeight: 900, marginTop: 4, textTransform: 'uppercase' }}>
                                {n(yama.mainActivity, lang)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Bird */}
                      <td style={{ ...tdStyle, fontWeight: 900, color: '#0f172a', fontSize: 10 }}>
                        {n(s.bird, lang)}
                      </td>

                      {/* Activity badge */}
                      <td style={tdStyle}>
                        {s.activity && (() => {
                          const ac = ACTIVITY_COLORS[s.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                          return (
                            <span style={{
                              padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900,
                              background: ac.bg, color: ac.text, whiteSpace: 'nowrap', display: 'inline-block'
                            }}>
                              {n(s.activity, lang)}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Relation */}
                      <td style={{ ...tdStyle, fontWeight: 800, color: '#334155', fontSize: 9.5 }}>
                        {n(s.relation, lang)}
                      </td>

                      {/* Time + horai/gowri/warnings badges */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', fontSize: 9.5, marginBottom: 4 }}>
                          {s.startLabel} – {s.endLabel}
                        </div>
                        {(hora || gowriSlot || warnings.length > 0) && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                             {/* ... badges same as before but slightly scaled ... */}
                            {hora && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900,
                                background: '#f1f5f9', color: '#1e293b',
                              }}>
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: PLANET_DOTS[hora.planet?.key] || '#94a3b8',
                                }} />
                                {t ? hora.planet?.tamil : hora.planet?.label}
                              </span>
                            )}
                            {gowriSlot && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900,
                                color: GOWRI_COLORS[gowriSlot.type?.nature]?.text || '#475569',
                                background: '#f8fafc', border: '1px solid #e2e8f0'
                              }}>
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: GOWRI_COLORS[gowriSlot.type?.nature]?.dot || '#94a3b8',
                                }} />
                                {t ? gowriSlot.type?.tamil : gowriSlot.type?.label}
                              </span>
                            )}
                            {warnings.map(w => {
                              const sl = SPECIAL_LABELS[w];
                              return sl ? (
                                <span key={w} style={{
                                  padding: '2px 6px', borderRadius: 4, fontSize: 7.5,
                                  fontWeight: 900, color: sl.color, background: sl.bg,
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
                            padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900,
                            background: '#eef2ff', color: '#4f46e5', display: 'inline-block'
                          }}>
                            {n(s.direction, lang)}
                          </span>
                        )}
                      </td>

                      {/* Palan */}
                      <td style={{ ...tdStyle, fontSize: 9, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                        {s.palan || '—'}
                      </td>

                      {/* Strength */}
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 900, fontSize: 11, color: strengthColor }}>
                        {s.strength}%
                      </td>
                    </tr>

                    {/* ── Sub-table (Sookshima) ───────────── */}
                    {showSubTable && (
                      <tr className="jamam-section" style={{ background: '#fffcf0' }}>
                        <td colSpan={8} style={{ padding: '0 8px 0 32px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9' }}>
                          <div style={{ borderLeft: '3px solid #fbbf24', paddingLeft: 12, margin: '8px 0' }}>
                            <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#b45309', marginBottom: 6 }}>
                              {labels.sookshima}
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
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
                                      <td style={{ padding: '5px 8px', fontWeight: 900, color: '#0f172a', fontSize: 9 }}>
                                        {n(sk.bird, lang)}
                                      </td>
                                      <td style={{ padding: '5px 8px' }}>
                                        {sk.activity && (() => {
                                          const ac = ACTIVITY_COLORS[sk.activity.key] || { bg: '#f1f5f9', text: '#334155' };
                                          return (
                                            <span style={{
                                              padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900,
                                              background: ac.bg, color: ac.text,
                                            }}>
                                              {n(sk.activity, lang)}
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      <td style={{ padding: '5px 8px', fontSize: 8.5, fontWeight: 800, color: '#475569' }}>
                                        {n(sk.relation, lang)}
                                      </td>
                                      <td style={{ padding: '5px 8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap' }}>
                                            {sk.startLabel} – {sk.endLabel}
                                          </span>
                                          {skHora && (
                                            <span style={{
                                              display: 'inline-flex', alignItems: 'center', gap: 3,
                                              padding: '1px 5px', borderRadius: 4, fontSize: 7.5, fontWeight: 900,
                                              background: '#f1f5f9', color: '#1e293b',
                                            }}>
                                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: PLANET_DOTS[skHora.planet?.key] || '#94a3b8' }} />
                                              {t ? skHora.planet?.tamil : skHora.planet?.label}
                                            </span>
                                          )}
                                          {skGowri && (
                                            <span style={{
                                              display: 'inline-flex', alignItems: 'center', gap: 3,
                                              padding: '1px 5px', borderRadius: 4, fontSize: 7.5, fontWeight: 900,
                                              color: GOWRI_COLORS[skGowri.type?.nature]?.text || '#475569',
                                            }}>
                                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOWRI_COLORS[skGowri.type?.nature]?.dot || '#94a3b8' }} />
                                              {t ? skGowri.type?.tamil : skGowri.type?.label}
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
