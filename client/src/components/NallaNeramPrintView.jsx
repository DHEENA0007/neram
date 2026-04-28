import React from 'react';

function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

const FONT = 'Inter, "Noto Sans Tamil", sans-serif';

const PLANET_DOT = {
  sun: '#f59e0b', moon: '#6366f1', mars: '#ef4444',
  mercury: '#22c55e', jupiter: '#f97316', venus: '#ec4899', saturn: '#334155',
};

const ACT_C = {
  ruling: { bg: '#fef3c7', text: '#92400e' },
  eating: { bg: '#d1fae5', text: '#065f46' },
};

function PrintHeader({ branding, lang, date }) {
  const t = lang === 'ta';
  if (!branding) return null;
  const name    = t ? (branding.astrologerNameTa || branding.astrologerNameEn || branding.astrologerName)
                    : (branding.astrologerNameEn || branding.astrologerName);
  const company = t ? (branding.companyNameTa || branding.companyNameEn || branding.companyName)
                    : (branding.companyNameEn || branding.companyName);
  const dateStr = new Date(date).toLocaleDateString(t ? 'ta-IN' : 'en-GB', { dateStyle: 'full' });

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: '#0f172a', color: '#fff', padding: '8px 12px', marginBottom: 10,
      fontFamily: FONT,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={branding.logoUrl || '/logo.png'}
             style={{ height: 38, width: 'auto', objectFit: 'contain', borderRadius: 4, background: '#fff', padding: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{company}</div>
          <div style={{ fontSize: 7.5, color: '#f59e0b', fontWeight: 700, marginTop: 1 }}>
            {t ? 'நல்ல நேரம் அறிக்கை' : 'Nalla Neram Report'} — {dateStr}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#f59e0b', letterSpacing: '0.02em' }}>{branding.mobile}</div>
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
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {branding.mobile   && <div><span style={{ fontWeight: 900, color: '#0f172a' }}>{t ? 'தொலை:' : 'Ph:'}</span> {branding.mobile}</div>}
        {branding.whatsapp && <div><span style={{ fontWeight: 900, color: '#0f172a' }}>{t ? 'WA:' : 'WA:'}</span> {branding.whatsapp}</div>}
        {branding.website  && <div><span style={{ fontWeight: 900, color: '#0f172a' }}>{t ? 'இணையம்:' : 'Web:'}</span> {branding.website}</div>}
        {branding.socialMedia?.map((s, i) => (
          <div key={i}><span style={{ fontWeight: 900, color: '#0f172a' }}>{s.platform}:</span> {s.url}</div>
        ))}
      </div>
      {addr && <div style={{ maxWidth: 200, textAlign: 'right', color: '#64748b' }}>{addr}</div>}
    </div>
  );
}

export function NallaNeramPrintView({ nallaSlots, avoidPeriods, lang, date, branding }) {
  const t = lang === 'ta';

  return (
    <div id="nalla-neram-print-view" style={{
      display: 'none',
      fontFamily: FONT,
      color: '#0f172a',
      background: '#fff',
      fontSize: 8.5,
      lineHeight: 1.35,
      width: '210mm',
    }}>
      <style>{`
        @media print {
          @page { margin: 4mm; size: A4; }
          body { margin: 0; padding: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-break { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      <PrintHeader branding={branding} lang={lang} date={date} />

      {/* Avoid periods */}
      {avoidPeriods.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ fontSize: 7.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9f1239', alignSelf: 'center', fontFamily: FONT }}>
            {t ? 'தவிர்க்கவும்:' : 'Avoid:'}
          </div>
          {avoidPeriods.map((p, i) => (
            <div key={i} style={{ padding: '4px 10px', borderRadius: 4, background: '#fff1f2', border: '1px solid #fecdd3', fontSize: 8, fontWeight: 800, color: '#9f1239', fontFamily: FONT }}>
              {p.label}: <span style={{ fontWeight: 900 }}>{p.startLabel} – {p.endLabel}</span>
            </div>
          ))}
        </div>
      )}

      {/* Section title */}
      <div style={{ fontSize: 7.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fff', background: '#059669', padding: '3px 8px', display: 'inline-block', borderRadius: 3, marginBottom: 10, fontFamily: FONT }}>
        {t ? `சுப நேரங்கள் — ${nallaSlots.length} நேரங்கள்` : `Auspicious Slots — ${nallaSlots.length} found`}
      </div>

      {/* Slots grid */}
      {nallaSlots.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {nallaSlots.map(({ sub, horaSlot, gowriSlot }, idx) => {
            const ac = ACT_C[sub.activity?.key] || { bg: '#f1f5f9', text: '#334155' };
            return (
              <div key={idx} className="no-break" style={{ padding: '8px 10px', border: '1px solid #bbf7d0', background: '#f0fdf4', borderRadius: 6, fontFamily: FONT }}>
                {/* Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#065f46', lineHeight: 1.1 }}>
                    {sub.startLabel}<br />
                    <span style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8' }}>– {sub.endLabel}</span>
                  </div>
                  <div style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase', color: '#fff', background: '#059669', padding: '2px 5px', borderRadius: 3 }}>
                    {sub.period === 'day' ? (t ? 'பகல்' : 'Day') : (t ? 'இரவு' : 'Night')}
                  </div>
                </div>
                {/* Tags */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 7.5, fontWeight: 800, background: ac.bg, color: ac.text, padding: '1px 5px', borderRadius: 3 }}>
                    {n(sub.bird, lang)} · {n(sub.activity, lang)}
                  </span>
                  {horaSlot && (
                    <span style={{ fontSize: 7.5, fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '1px 5px', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: PLANET_DOT[horaSlot.planet?.key] || '#94a3b8', flexShrink: 0 }} />
                      {n(horaSlot.planet, lang)}
                    </span>
                  )}
                  {gowriSlot && (
                    <span style={{ fontSize: 7.5, fontWeight: 800, background: gowriSlot.type?.nature === 'good' ? '#d1fae5' : '#ffe4e6', color: gowriSlot.type?.nature === 'good' ? '#065f46' : '#9f1239', padding: '1px 5px', borderRadius: 3 }}>
                      {n(gowriSlot.type, lang)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontStyle: 'italic', fontSize: 9, fontFamily: FONT }}>
          {t ? 'தேர்ந்தெடுத்த வடிகட்டிகளுக்கு ஏற்ப நல்ல நேரம் இல்லை.' : 'No auspicious slots found for the selected filters.'}
        </div>
      )}

      <PrintFooter branding={branding} lang={lang} />
    </div>
  );
}
