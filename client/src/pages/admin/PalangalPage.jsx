import { useEffect, useState } from 'react';
import { loadPalangal, savePalangal, createPalangal, deletePalangal } from '../../api.js';
import { birdOptions, activityOptions, relationOptions, effectOptions } from '../../shared/constants.js';
import { IconCheck, IconInfo, IconBan } from '../../components/Icons.jsx';

export function PalangalPage() {
  const [palangal, setPalangal] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  
  // New rule form
  const [newRule, setNewRule] = useState({ 
    activityKey: 'ruling', 
    relationKey: 'friend', 
    effectKey: '', 
    birdId: '',
    yamaIndex: '',
    subIndex: '',
    text: '' 
  });
  const [adding, setAdding] = useState(false);

  // Editing state
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved]   = useState({});

  async function refresh() {
    setError('');
    try {
      const d = await loadPalangal();
      const list = d.palangal || [];
      // Sort by updatedAt desc
      list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setPalangal(list);
      const init = {};
      for (const p of list) init[p.id] = p.text;
      setDrafts(init);
    } catch (err) {
      setError(err.message || 'Failed to load palangal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newRule.text.trim()) return;
    setAdding(true);
    try {
      await createPalangal(newRule);
      setNewRule({ ...newRule, text: '' });
      await refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdate(id) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const updated = await savePalangal(id, { text: drafts[id] });
      setPalangal((prev) => prev.map((p) => p.id === id ? updated.palangal : p));
      setSaved((s) => ({ ...s, [id]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [id]: false })), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await deletePalangal(id);
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">பலன் மேலாண்மை · Engine Config</p>
          <h1 className="admin-page-title">Palangal · பலன்கள்</h1>
        </div>
        <p className="admin-page-sub">
          {palangal.length} dynamic prediction rules
        </p>
      </div>

      <div className="ap-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)', background: 'rgba(15,118,110,.04)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <IconInfo size={20} style={{ color: 'var(--accent)', marginTop: '2px' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '.9rem' }}>Advanced Rule Priority</p>
            <p className="muted" style={{ fontSize: '.82rem', marginTop: '.2rem' }}>
              The engine prioritizes rules based on specificity. <strong>Bird</strong> rules have highest priority, 
              followed by <strong>Effect</strong>, then <strong>Time (Yama/Sub-period)</strong>. General rules are used as fallbacks.
            </p>
          </div>
        </div>
      </div>

      <div className="palangal-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Rules List */}
        <div className="rules-list-container">
          {loading ? (
             <div className="ap-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>Loading rules...</div>
          ) : palangal.length === 0 ? (
             <div className="ap-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>No rules defined yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {palangal.map((p) => {
                const isDirty = drafts[p.id] !== p.text;
                const isSaving = saving[p.id];
                const isSaved = saved[p.id];
                
                return (
                  <div key={p.id} className="ap-card palangal-item-dynamic" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                        <span className="relation-badge" style={{ background: 'rgba(15,118,110,.1)', color: 'var(--accent)' }}>
                          {activityOptions.find(a => a.key === p.activityKey)?.label}
                        </span>
                        <span className="relation-badge" style={{ background: 'rgba(180,83,9,.1)', color: 'var(--accent2)' }}>
                          {relationOptions.find(r => r.key === p.relationKey)?.label}
                        </span>
                        {p.effectKey && (
                          <span className="relation-badge rb-green">
                            {effectOptions.find(e => e.key === p.effectKey)?.label}
                          </span>
                        )}
                        {p.birdId && (
                            <span className="relation-badge" style={{ background: 'var(--ink)', color: '#fff' }}>
                                Bird: {birdOptions.find(b => b.id === Number(p.birdId))?.label}
                            </span>
                        )}
                        {p.yamaIndex && (
                            <span className="relation-badge" style={{ background: '#4f46e5', color: '#fff' }}>
                                Yama {p.yamaIndex}
                            </span>
                        )}
                        {p.subIndex && (
                            <span className="relation-badge" style={{ background: '#7c3aed', color: '#fff' }}>
                                Sub {p.subIndex}
                            </span>
                        )}
                      </div>
                      <button className="ap-toggle-btn" onClick={() => handleDelete(p.id)} style={{ color: '#b91c1c', border: '1px solid rgba(185,28,28,.2)', padding: '.2rem .5rem', fontSize: '.75rem' }}>
                        Remove
                      </button>
                    </div>

                    <textarea
                      className="palangal-textarea"
                      rows={2}
                      value={drafts[p.id] ?? p.text}
                      onChange={(e) => setDrafts(d => ({ ...d, [p.id]: e.target.value }))}
                      placeholder="Prediction text details..."
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.75rem', alignItems: 'center', gap: '1rem' }}>
                      {isSaved && <span className="save-tick" style={{ fontSize: '.8rem' }}><IconCheck size={12} /> Synced</span>}
                      <button
                        className={`palangal-save-btn${isDirty ? ' dirty' : ''}`}
                        onClick={() => handleUpdate(p.id)}
                        disabled={isSaving || !isDirty}
                      >
                        {isSaving ? 'Saving...' : 'Update Content'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Form */}
        <div className="ap-card" style={{ position: 'sticky', top: '1.5rem' }}>
          <div className="ap-card-head">
            <span className="ap-eyebrow">புதிய பலன்</span>
            <h2>Create Smart Rule</h2>
          </div>
          
          <form onSubmit={handleCreate} className="ap-form">
            <div className="ap-field">
              <label>Core Activity · தொழில்</label>
              <select className="text-input" value={newRule.activityKey} onChange={e => setNewRule({...newRule, activityKey: e.target.value})}>
                {activityOptions.map(a => <option key={a.key} value={a.key}>{a.label} · {a.tamil}</option>)}
              </select>
            </div>
            
            <div className="ap-field">
              <label>Relation · உறவு</label>
              <select className="text-input" value={newRule.relationKey} onChange={e => setNewRule({...newRule, relationKey: e.target.value})}>
                {relationOptions.map(r => <option key={r.key} value={r.key}>{r.label} · {r.tamil}</option>)}
              </select>
            </div>

            <div className="ap-field">
              <label>Specific Effect (Opt) · விளைவு</label>
              <select className="text-input" value={newRule.effectKey} onChange={e => setNewRule({...newRule, effectKey: e.target.value})}>
                <option value="">Any Effect</option>
                {effectOptions.map(e => <option key={e.key} value={e.key}>{e.label} · {e.tamil}</option>)}
              </select>
            </div>

            <div className="ap-field">
              <label>Specific Bird (Opt) · பட்சி</label>
              <select className="text-input" value={newRule.birdId} onChange={e => setNewRule({...newRule, birdId: e.target.value})}>
                <option value="">Any Bird</option>
                {birdOptions.map(b => <option key={b.id} value={b.id}>{b.label} · {b.tamil}</option>)}
              </select>
            </div>

            <div className="ap-field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div className="ap-field">
                    <label>Yama (Opt)</label>
                    <select className="text-input" value={newRule.yamaIndex} onChange={e => setNewRule({...newRule, yamaIndex: e.target.value})}>
                        <option value="">Any</option>
                        {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>Yama {i}</option>)}
                    </select>
                </div>
                <div className="ap-field">
                    <label>Sub (Opt)</label>
                    <select className="text-input" value={newRule.subIndex} onChange={e => setNewRule({...newRule, subIndex: e.target.value})}>
                        <option value="">Any</option>
                        {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>Sub {i}</option>)}
                    </select>
                </div>
            </div>

            <div className="ap-field">
              <label>Prediction Narrative · பலன்</label>
              <textarea 
                className="palangal-textarea" 
                rows={4} 
                value={newRule.text} 
                onChange={e => setNewRule({...newRule, text: e.target.value})}
                placeholder="Compose the prediction here..."
                required
              />
            </div>

            <button className="primary-button" type="submit" disabled={adding} style={{ width: '100%', marginTop: '.5rem' }}>
              {adding ? 'Adding Smart Rule...' : 'Register Rule'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: '12px', fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong>Tip:</strong> Rules with more parameters selected (like specific Bird or Yama) will take precedence over general ones.
          </div>
        </div>

      </div>
    </div>
  );
}
