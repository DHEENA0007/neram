import React from 'react';

/* ── helpers ────────────────────────────────────────────────── */
function n(obj, lang) { return lang === 'ta' ? obj?.tamil : obj?.label; }

function fmtDate(d, lang) {
  return new Date(d).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

const ACTIVITY_ABBR = {
  ruling: { en: 'Ruling', ta: 'ஆட்சி' },
  eating: { en: 'Eating', ta: 'ஊன்' },
  walking: { en: 'Walking', ta: 'நடை' },
  sleeping: { en: 'Sleeping', ta: 'தூக்கம்' },
  dying: { en: 'Dying', ta: 'சாவு' },
};

const GOWRI_NATURE = {
  good: { en: '✓', ta: '✓' },
  bad: { en: '✗', ta: '✗' },
};

/* ── sub-components ─────────────────────────────────────────── */

function SectionTitle({ children }) {
  return (
    <div style={{ marginTop: 12, marginBottom: 4 }}>
      <div style={{
        background: '#1e293b', color: '#fff', padding: '3px 8px',
        fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
        textTransform: 'uppercase', display: 'inline-block', borderRadius: 3
      }}>
        {children}
      </div>
    </div>
  );
}

function Tbl({ children, style }) {
  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse', fontSize: 9,
      fontFamily: 'Inter, "Noto Sans Tamil", sans-serif', ...style
    }}>
      {children}
    </table>
  );
}

function Th({ children, style, align = 'left' }) {
  return (
    <th style={{
      background: '#f1f5f9', padding: '3px 5px', fontWeight: 800,
      fontSize: 7.5, letterSpacing: '0.05em', textTransform: 'uppercase',
      color: '#475569', border: '1px solid #e2e8f0', textAlign: align, ...style
    }}>
      {children}
    </th>
  );
}

function Td({ children, style, align = 'left' }) {
  return (
    <td style={{
      padding: '3px 5px', border: '1px solid #e2e8f0',
      color: '#334155', verticalAlign: 'middle', textAlign: align, ...style
    }}>
      {children}
    </td>
  );
}

/* ── main PrintView ─────────────────────────────────────────── */

export function PrintView({ prediction, lang, locationName }) {
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

  return (
    <div id="print-view" style={{
      display: 'none',
      fontFamily: 'Inter, "Noto Sans Tamil", sans-serif',
      color: '#0f172a',
      background: '#fff',
      padding: '10px 24px',
      fontSize: 8.5,
      lineHeight: 1.3,
    }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ borderBottom: '2px solid #f59e0b', paddingBottom: 10, marginBottom: 12 }}>
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
            [t ? 'பகல் திசை' : 'Day Direction', n(dayPaksha?.direction, lang)],
            [t ? 'இரவு திசை' : 'Night Direction', n(nightPaksha?.direction, lang)],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#1e293b' }}>{val || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SPECIAL PERIODS ─────────────────────────────────── */}
      <SectionTitle>{t ? 'சிறப்பு காலங்கள்' : 'Special Periods'}</SectionTitle>
      <Tbl>
        <thead>
          <tr>
            <Th>{t ? 'ராகு காலம்' : 'Rahu Kaalam'}</Th>
            <Th>{t ? 'எமகண்டம்' : 'Yamagandam'}</Th>
            <Th>{t ? 'குளிகன்' : 'Kulikai'}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td style={{ color: '#be123c', fontWeight: 700 }}>
              {sp?.rahu ? `${sp.rahu.startLabel} – ${sp.rahu.endLabel}` : '—'}
            </Td>
            <Td style={{ color: '#b45309', fontWeight: 700 }}>
              {sp?.yamagandam ? `${sp.yamagandam.startLabel} – ${sp.yamagandam.endLabel}` : '—'}
            </Td>
            <Td style={{ color: '#1d4ed8', fontWeight: 700 }}>
              {sp?.kulikai ? `${sp.kulikai.startLabel} – ${sp.kulikai.endLabel}` : '—'}
            </Td>
          </tr>
        </tbody>
      </Tbl>

      {/* ── DAY YAMAS ───────────────────────────────────────── */}
      <SectionTitle>{t ? 'பகல் யாம அட்டவணை' : 'Day Yama Schedule'}</SectionTitle>
      <YamaTable yamas={prediction.dayYamas} lang={lang} />

      {/* ── NIGHT YAMAS ─────────────────────────────────────── */}
      <SectionTitle>{t ? 'இரவு யாம அட்டவணை' : 'Night Yama Schedule'}</SectionTitle>
      <YamaTable yamas={prediction.nightYamas} lang={lang} />

      {/* ── HORAI ────────────────────────────────────────────── */}
      <div style={{ marginTop: 10 }}>
        <SectionTitle>{t ? 'ஹோரை அட்டவணை' : 'Horai Schedule'}</SectionTitle>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <HoraiBlock title={t ? 'பகல் ஹோரை' : 'Day Horai'} items={dayHorai} lang={lang} />
          </div>
          <div style={{ flex: 1 }}>
            <HoraiBlock title={t ? 'இரவு ஹோரை' : 'Night Horai'} items={nightHorai} lang={lang} />
          </div>
        </div>
      </div>

      {/* ── GOWRI ────────────────────────────────────────────── */}
      <div style={{ marginTop: 20 }}>
        <SectionTitle>{t ? 'கௌரி பஞ்சாங்கம்' : 'Gowri Panchangam'}</SectionTitle>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <GowriBlock title={t ? 'பகல் கௌரி' : 'Day Gowri'} items={dayGowri} lang={lang} />
          </div>
          <div style={{ flex: 1 }}>
            <GowriBlock title={t ? 'இரவு கௌரி' : 'Night Gowri'} items={nightGowri} lang={lang} />
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#94a3b8' }}>
        <span>{t ? 'நேரம் — பஞ்சபட்சி கணினி' : 'Neram — Pancha Pakshi Calculator'}</span>
        <span>{new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ── Yama Table ─────────────────────────────────────────────── */
function YamaTable({ yamas, lang }) {
  if (!yamas?.length) return null;
  const t = lang === 'ta';
  return (
    <Tbl>
      <thead>
        <tr>
          <Th style={{ width: 20 }}>#</Th>
          <Th style={{ width: 65 }}>{t ? 'நேரம்' : 'Time'}</Th>
          <Th style={{ width: 55 }}>{t ? 'பட்சி' : 'Bird'}</Th>
          <Th style={{ width: 50 }}>{t ? 'தொழில்' : 'Activity'}</Th>
          <Th style={{ width: 50 }}>{t ? 'திசை' : 'Direction'}</Th>
          <Th>{t ? 'சூட்சும விவரம்' : 'Sub-rows (Bird / Activity / Time)'}</Th>
          <Th style={{ width: 35 }} align="right">{t ? 'பலம்' : 'Strength'}</Th>
        </tr>
      </thead>
      <tbody>
        {yamas.map((yama) =>
          yama.subRows.map((sub, si) => (
            <tr key={`${yama.index}-${si}`} style={{ background: si % 2 === 0 ? '#fff' : '#f8fafc' }}>
              {si === 0 && (
                <>
                  <Td style={{ fontWeight: 900, color: '#b45309', background: '#fefce8', fontSize: 10 }} align="center">
                    <span style={{ display: 'block' }}>#{yama.index}</span>
                  </Td>
                  <Td style={{ fontWeight: 700, fontSize: 8, whiteSpace: 'nowrap', background: '#fefce8' }}>
                    {yama.startLabel}<br /><span style={{ color: '#94a3b8' }}>– {yama.endLabel}</span>
                  </Td>
                  <Td style={{ fontWeight: 800, background: '#fefce8' }}>
                    {n(yama.mainBird, lang)}
                  </Td>
                  <Td style={{ background: '#fefce8' }}>
                    <span style={{ padding: '1px 4px', borderRadius: 3, fontSize: 8, fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                      {(ACTIVITY_ABBR[yama.mainActivity?.key] || {})[lang] || yama.mainActivity?.key}
                    </span>
                  </Td>
                  <Td style={{ fontSize: 8, color: '#4f46e5', fontWeight: 700, background: '#fefce8' }}>
                    {n(yama.direction, lang) || '—'}
                  </Td>
                </>
              )}
              {si > 0 && <><Td /><Td /><Td /><Td /><Td /></>}
              {/* sub info */}
              <Td style={{ fontSize: 8 }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{n(sub.bird, lang)}</span>
                {' / '}
                <span style={{ color: '#64748b' }}>
                  {(ACTIVITY_ABBR[sub.activity?.key] || {})[lang] || sub.activity?.key}
                </span>
                {' '}
                <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {sub.startLabel} – {sub.endLabel}
                </span>
                {sub.palan ? <span style={{ display: 'block', color: '#059669', fontSize: 7.5, marginTop: 1 }}>{sub.palan}</span> : null}
              </Td>
              <Td align="right" style={{ fontWeight: 800, fontSize: 8, color: Number(sub.strength) >= 50 ? '#059669' : '#dc2626' }}>
                {sub.strength}%
              </Td>
            </tr>
          ))
        )}
      </tbody>
    </Tbl>
  );
}

/* ── Horai Block ────────────────────────────────────────────── */
function HoraiBlock({ title, items, lang }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{title}</div>
      <Tbl>
        <thead>
          <tr>
            <Th style={{ width: 20 }}>#</Th>
            <Th>{lang === 'ta' ? 'கிரகம்' : 'Planet'}</Th>
            <Th>{lang === 'ta' ? 'நேரம்' : 'Time'}</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((h, i) => (
            <tr key={h.index} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <Td align="center" style={{ fontWeight: 700, color: '#94a3b8' }}>{h.index}</Td>
              <Td style={{ fontWeight: 800 }}>{n(h.planet, lang)}</Td>
              <Td style={{ fontFamily: 'monospace', fontSize: 8, color: '#64748b', whiteSpace: 'nowrap' }}>
                {h.startLabel} – {h.endLabel}
              </Td>
            </tr>
          ))}
        </tbody>
      </Tbl>
    </div>
  );
}

/* ── Gowri Block ────────────────────────────────────────────── */
function GowriBlock({ title, items, lang }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{title}</div>
      <Tbl>
        <thead>
          <tr>
            <Th style={{ width: 20 }}>#</Th>
            <Th>{lang === 'ta' ? 'வகை' : 'Type'}</Th>
            <Th style={{ width: 20 }} align="center">{lang === 'ta' ? 'தன்மை' : 'Nature'}</Th>
            <Th>{lang === 'ta' ? 'நேரம்' : 'Time'}</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((g, i) => {
            const isGood = g.type.nature === 'good';
            return (
              <tr key={g.index} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <Td align="center" style={{ fontWeight: 700, color: '#94a3b8' }}>{g.index}</Td>
                <Td style={{ fontWeight: 800, color: isGood ? '#059669' : '#dc2626' }}>
                  {n(g.type, lang)}
                </Td>
                <Td align="center" style={{ fontWeight: 900, color: isGood ? '#059669' : '#dc2626', fontSize: 10 }}>
                  {isGood ? '✓' : '✗'}
                </Td>
                <Td style={{ fontFamily: 'monospace', fontSize: 8, color: '#64748b', whiteSpace: 'nowrap' }}>
                  {g.startLabel} – {g.endLabel}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Tbl>
    </div>
  );
}
