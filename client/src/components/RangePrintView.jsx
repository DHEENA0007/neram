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

/* ── shared print primitives ─────────────────────────── */
const baseFont = { fontFamily: 'Inter, "Noto Sans Tamil", sans-serif' };

function Tbl({ children, style }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8, ...baseFont, ...style }}>
      {children}
    </table>
  );
}
function Th({ children, style, align = 'left' }) {
  return (
    <th style={{
      background: '#1e293b', color: '#fff', padding: '4px 6px',
      fontWeight: 800, fontSize: 7, letterSpacing: '0.07em',
      textTransform: 'uppercase', border: '1px solid #334155',
      textAlign: align, ...style,
    }}>{children}</th>
  );
}
function Td({ children, style, align = 'left' }) {
  return (
    <td style={{
      padding: '3px 6px', border: '1px solid #e2e8f0',
      color: '#334155', verticalAlign: 'middle', textAlign: align, ...style,
    }}>{children}</td>
  );
}
function SectionBreak() {
  return <div style={{ pageBreakBefore: 'always', marginTop: 0 }} />;
}
function SectionHeader({ children }) {
  return (
    <div style={{
      background: '#b45309', color: '#fff', padding: '5px 10px',
      fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
      textTransform: 'uppercase', marginBottom: 6, borderRadius: 3,
      ...baseFont,
    }}>{children}</div>
  );
}
function PageHeader({ title, fromDate, toDate, locationName, lang }) {
  const tl = lang === 'ta';
  return (
    <div style={{ borderBottom: '2px solid #f59e0b', paddingBottom: 8, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', ...baseFont }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#b45309' }}>{title}</div>
        <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
          {fmtDate(fromDate, lang)} — {fmtDate(toDate, lang)}
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 8, color: '#94a3b8' }}>
        <div style={{ fontWeight: 700 }}>{locationName}</div>
        <div>{new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}

/* ── Special Periods Table (Rahu / Yama / Kuli) ───────── */
function SpecialPeriodsSection({ days, categories, lang, fromDate, toDate, locationName }) {
  const tl = lang === 'ta';
  const showRahu = categories.includes('rahu');
  const showYama = categories.includes('yama');
  const showKuli = categories.includes('kuli');
  if (!showRahu && !showYama && !showKuli) return null;

  return (
    <div>
      <PageHeader
        title={tl ? 'சிறப்பு காலங்கள் அட்டவணை' : 'Special Periods Table'}
        fromDate={fromDate} toDate={toDate} locationName={locationName} lang={lang}
      />
      <Tbl>
        <thead>
          <tr>
            <Th style={{ width: 60 }}>{tl ? 'தேதி' : 'Date'}</Th>
            <Th style={{ width: 55 }}>{tl ? 'கிழமை' : 'Day'}</Th>
            <Th style={{ width: 55 }}>{tl ? 'பிறை' : 'Paksha'}</Th>
            {showRahu && <Th style={{ color: '#fca5a5' }}>{tl ? 'ராகு காலம்' : 'Rahu Kalam'}</Th>}
            {showYama && <Th style={{ color: '#fed7aa' }}>{tl ? 'எமகண்டம்' : 'Yamagandam'}</Th>}
            {showKuli && <Th style={{ color: '#ddd6fe' }}>{tl ? 'குளிகன்' : 'Kulikan'}</Th>}
          </tr>
        </thead>
        <tbody>
          {days.map((day, idx) => {
            const sp = day.specialPeriods;
            const isEven = idx % 2 === 0;
            const bg = isEven ? '#fff' : '#f8fafc';
            return (
              <tr key={day.date} style={{ background: bg }}>
                <Td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtDateShort(day.date)}</Td>
                <Td>{n(day.weekday, lang)}</Td>
                <Td style={{ fontSize: 7 }}>
                  {n(day.paksha?.day, lang)}
                </Td>
                {showRahu && (
                  <Td style={{ color: '#be123c', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {sp?.rahu ? `${sp.rahu.startLabel} – ${sp.rahu.endLabel}` : '—'}
                  </Td>
                )}
                {showYama && (
                  <Td style={{ color: '#b45309', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {sp?.yamagandam ? `${sp.yamagandam.startLabel} – ${sp.yamagandam.endLabel}` : '—'}
                  </Td>
                )}
                {showKuli && (
                  <Td style={{ color: '#6d28d9', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {sp?.kulikai ? `${sp.kulikai.startLabel} – ${sp.kulikai.endLabel}` : '—'}
                  </Td>
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
    <div>
      <PageHeader
        title={tl ? 'ஹோரை அட்டவணை' : 'Horai Schedule'}
        fromDate={fromDate} toDate={toDate} locationName={locationName} lang={lang}
      />
      {days.map((day, di) => (
        <div key={day.date} style={{ marginBottom: 12, pageBreakInside: 'avoid' }}>
          <div style={{
            background: '#fef3c7', padding: '3px 8px', fontSize: 9,
            fontWeight: 900, color: '#92400e', marginBottom: 4,
            borderLeft: '3px solid #f59e0b', ...baseFont,
          }}>
            {fmtDate(day.date, lang)} — {n(day.weekday, lang)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {/* Day horas */}
            <div>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#b45309', marginBottom: 2, ...baseFont }}>
                {tl ? 'பகல் ஹோரை' : 'Day Horai'}
              </div>
              <Tbl>
                <thead>
                  <tr>
                    <Th style={{ width: 20 }}>#</Th>
                    <Th>{tl ? 'கிரகம்' : 'Planet'}</Th>
                    <Th>{tl ? 'நேரம்' : 'Time'}</Th>
                  </tr>
                </thead>
                <tbody>
                  {(day.horai || []).filter(h => h.period === 'day').map((h, i) => (
                    <tr key={h.index} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <Td align="center" style={{ color: '#94a3b8', fontWeight: 700 }}>{h.index}</Td>
                      <Td style={{ fontWeight: 800 }}>{n(h.planet, lang)}</Td>
                      <Td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: 7.5 }}>
                        {h.startLabel} – {h.endLabel}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Tbl>
            </div>
            {/* Night horas */}
            <div>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#4f46e5', marginBottom: 2, ...baseFont }}>
                {tl ? 'இரவு ஹோரை' : 'Night Horai'}
              </div>
              <Tbl>
                <thead>
                  <tr>
                    <Th style={{ width: 20, background: '#312e81' }}>#</Th>
                    <Th style={{ background: '#312e81' }}>{tl ? 'கிரகம்' : 'Planet'}</Th>
                    <Th style={{ background: '#312e81' }}>{tl ? 'நேரம்' : 'Time'}</Th>
                  </tr>
                </thead>
                <tbody>
                  {(day.horai || []).filter(h => h.period === 'night').map((h, i) => (
                    <tr key={h.index} style={{ background: i % 2 === 0 ? '#fff' : '#f0f0ff' }}>
                      <Td align="center" style={{ color: '#94a3b8', fontWeight: 700 }}>{h.index}</Td>
                      <Td style={{ fontWeight: 800 }}>{n(h.planet, lang)}</Td>
                      <Td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: 7.5 }}>
                        {h.startLabel} – {h.endLabel}
                      </Td>
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
const ACTIVITY_ABBR = {
  ruling: { en: 'Ruling', ta: 'ஆட்சி' }, eating: { en: 'Eating', ta: 'ஊன்' },
  walking: { en: 'Walking', ta: 'நடை' }, sleeping: { en: 'Sleeping', ta: 'தூக்கம்' },
  dying: { en: 'Dying', ta: 'சாவு' },
};

function ScheduleSection({ days, lang, fromDate, toDate, locationName }) {
  const tl = lang === 'ta';
  return (
    <div>
      <PageHeader
        title={tl ? 'பஞ்சபட்சி முழு அட்டவணை' : 'Full Pancha Pakshi Schedule'}
        fromDate={fromDate} toDate={toDate} locationName={locationName} lang={lang}
      />
      {days.map((day, di) => (
        <div key={day.date} style={{ marginBottom: 16, pageBreakInside: 'avoid' }}>
          <div style={{
            background: '#1e293b', color: '#fff', padding: '4px 10px',
            fontSize: 10, fontWeight: 900, marginBottom: 6, ...baseFont,
          }}>
            {fmtDate(day.date, lang)} — {n(day.weekday, lang)}
            <span style={{ fontWeight: 400, fontSize: 8, marginLeft: 12, opacity: 0.7 }}>
              {tl ? 'பகல் பிறை:' : 'Day Paksha:'} {n(day.paksha?.day, lang)} |{' '}
              {tl ? 'இரவு பிறை:' : 'Night Paksha:'} {n(day.paksha?.night, lang)}
            </span>
          </div>
          {/* Special periods row */}
          {day.specialPeriods && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 5, fontSize: 8, ...baseFont }}>
              {[
                [tl ? 'ராகு காலம்' : 'Rahu', day.specialPeriods.rahu, '#be123c'],
                [tl ? 'எமகண்டம்' : 'Yama', day.specialPeriods.yamagandam, '#b45309'],
                [tl ? 'குளிகன்' : 'Kuli', day.specialPeriods.kulikai, '#6d28d9'],
              ].map(([label, p, color]) => (
                <div key={label} style={{ fontWeight: 700, color }}>
                  {label}: {p ? `${p.startLabel} – ${p.endLabel}` : '—'}
                </div>
              ))}
            </div>
          )}
          {/* Day + Night yamas side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              [tl ? 'பகல் அட்டவணை' : 'Day Schedule', day.dayYamas, '#b45309'],
              [tl ? 'இரவு அட்டவணை' : 'Night Schedule', day.nightYamas, '#4f46e5'],
            ].map(([title, yamas, color]) => (
              <div key={title}>
                <div style={{ fontSize: 8, fontWeight: 800, color, marginBottom: 3, ...baseFont }}>{title}</div>
                <Tbl>
                  <thead>
                    <tr>
                      <Th style={{ width: 18 }}>#</Th>
                      <Th style={{ width: 55 }}>{tl ? 'நேரம்' : 'Time'}</Th>
                      <Th>{tl ? 'பட்சி / தொழில்' : 'Bird / Activity'}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(yamas || []).map(yama =>
                      yama.subRows.map((sub, si) => (
                        <tr key={`${yama.index}-${si}`} style={{ background: si % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          {si === 0 ? (
                            <Td align="center" style={{ fontWeight: 900, color, fontSize: 9 }}>
                              {yama.index}
                            </Td>
                          ) : <Td />}
                          <Td style={{ fontSize: 7, whiteSpace: 'nowrap', color: '#64748b' }}>
                            {sub.startLabel} – {sub.endLabel}
                          </Td>
                          <Td style={{ fontSize: 7.5 }}>
                            <span style={{ fontWeight: 800 }}>{n(sub.bird, lang)}</span>
                            {' / '}
                            <span style={{ color: '#94a3b8' }}>
                              {(ACTIVITY_ABBR[sub.activity?.key] || {})[lang] || sub.activity?.key}
                            </span>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Tbl>
              </div>
            ))}
          </div>
          {di < days.length - 1 && <SectionBreak />}
        </div>
      ))}
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────── */
export function RangePrintView({ rangeData, categories, lang, locationName, fromDate, toDate }) {
  if (!rangeData?.days?.length) return null;

  const tl = lang === 'ta';
  const days = rangeData.days;
  const hasSpecial  = categories.some(c => ['rahu', 'yama', 'kuli'].includes(c));
  const hasHorai    = categories.includes('horai');
  const hasSchedule = categories.includes('schedule');

  return (
    <div id="range-print-view" style={{
      display: 'none',
      fontFamily: 'Inter, "Noto Sans Tamil", sans-serif',
      background: '#fff',
      padding: '10px 20px',
      color: '#0f172a',
    }}>
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
            days={days} lang={lang}
            fromDate={fromDate} toDate={toDate} locationName={locationName}
          />
        </>
      )}

      <div style={{
        borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 4,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 7, color: '#94a3b8', ...baseFont,
      }}>
        <span>{tl ? 'நேரம் — பஞ்சபட்சி கணினி' : 'Neram — Pancha Pakshi'}</span>
        <span>{new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}
