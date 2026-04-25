import React from 'react';

function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

const ACTIVITY_COLORS = {
  ruling:   { bg: '#fef3c7', text: '#b45309' },
  eating:   { bg: '#d1fae5', text: '#047857' },
};

const PLANET_DOTS = {
  sun: '#f59e0b', moon: '#6366f1', mars: '#ef4444',
  mercury: '#22c55e', jupiter: '#f97316', venus: '#ec4899', saturn: '#1e293b',
};

const GOWRI_COLORS = {
  good: { dot: '#059669', text: '#059669' },
  bad: { dot: '#dc2626', text: '#dc2626' },
};

export function NallaNeramPrintView({ nallaSlots, avoidPeriods, lang, date, branding }) {
  const t = lang === 'ta';
  const font = 'Inter, "Noto Sans Tamil", sans-serif';

  return (
    <div id="nalla-neram-print-view" style={{
      display: 'none',
      fontFamily: font,
      color: '#0f172a',
      background: '#fff',
      padding: '20px',
      fontSize: 9,
    }}>
      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; }
          #nalla-neram-print-view { padding: 1.5cm !important; display: block !important; }
        }
      `}</style>

      {/* HEADER */}
      {branding && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, marginBottom: 30, borderBottom: '2px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" style={{ height: 45, width: 'auto' }} />
            <div>
               <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{branding.astrologerName || 'Sri Vinayaga Astro'}</div>
               <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{branding.companyName}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#b45309' }}>{t ? 'நல்ல நேரம் அறிக்கை' : 'Nalla Neram Report'}</div>
            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{new Date(date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', { dateStyle: 'full' })}</div>
          </div>
        </div>
      )}

      {/* AVOID PERIODS */}
      {avoidPeriods.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#be123c', marginBottom: 8, letterSpacing: '0.1em' }}>
            {t ? 'தவிர்க்க வேண்டிய காலங்கள்' : 'Periods to Avoid'}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {avoidPeriods.map((p, i) => (
              <div key={i} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #fee2e2', background: '#fff1f2', color: '#be123c', fontWeight: 800, fontSize: 8.5 }}>
                {p.label}: {p.startLabel} – {p.endLabel}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SLOTS */}
      <div>
        <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#059669', marginBottom: 12, letterSpacing: '0.1em' }}>
          {t ? 'சுப நேரங்கள் (நல்ல நேரம்)' : 'Auspicious Time Slots (Nalla Neram)'}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {nallaSlots.map(({ sub, horaSlot, gowriSlot }, idx) => {
            return (
              <div key={idx} style={{ padding: 12, border: '1px solid #ecfdf5', background: '#f0fdf4', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#065f46' }}>{sub.startLabel} – {sub.endLabel}</div>
                  <div style={{ fontSize: 7, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                    {sub.period === 'day' ? (t ? 'பகல்' : 'Day') : (t ? 'இரவு' : 'Night')}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 7.5, fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: 3 }}>
                    {n(sub.bird, lang)} · {n(sub.activity, lang)}
                  </span>
                  
                  {horaSlot && (
                    <span style={{ fontSize: 7.5, fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: PLANET_DOTS[horaSlot.planet.key] || '#94a3b8' }} />
                      {n(horaSlot.planet, lang)}
                    </span>
                  )}

                  {gowriSlot && (
                    <span style={{ fontSize: 7.5, fontWeight: 800, background: '#f0f9ff', color: '#0369a1', padding: '1px 5px', borderRadius: 3 }}>
                      {n(gowriSlot.type, lang)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {nallaSlots.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontStyle: 'italic' }}>No slots found for selected filters.</div>}
      </div>

      {/* FOOTER */}
      {branding && (
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '2px solid #f1f5f9', pageBreakInside: 'avoid' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Contact Details</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>{t ? 'தொலைபேசி:' : 'Phone:'} {branding.mobile}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>{t ? 'வாட்ஸ்அப்:' : 'WhatsApp:'} {branding.whatsapp}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>{t ? 'இணையதளம்:' : 'Website:'} {branding.website}</div>
            </div>
            {branding.address && (
              <div>
                <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Address</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>{branding.address}</div>
              </div>
            )}
          </div>
          {branding.socialMedia?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              {branding.socialMedia.map((s, i) => (
                <div key={i} style={{ fontSize: 8, fontWeight: 800, color: '#6366f1', background: '#f5f3ff', padding: '2px 6px', borderRadius: 4 }}>
                  {s.platform}: {s.url}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
