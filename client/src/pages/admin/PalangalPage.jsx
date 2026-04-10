import { useEffect, useState } from 'react';
import { loadPalangal, savePalangal, createPalangal, deletePalangal } from '../../api.js';
import { birdOptions, activityOptions, relationOptions, effectOptions } from '../../shared/constants.js';
import { IconCheck, IconInfo, IconBan, IconList } from '../../components/Icons.jsx';

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
        <div className="text-right">
            <p className="admin-page-sub">
            {palangal.length} dynamic prediction rules
            </p>
        </div>
      </div>

      <div className="ap-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-amber-500)', background: 'rgba(245,158,11,.03)' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <IconInfo size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Advanced Rule Priority</p>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              The engine prioritizes rules based on specificity. <strong>Bird</strong> rules have highest priority, 
              followed by <strong>Effect</strong>, then <strong>Time (Yama/Sub-period)</strong>. General rules are used as fallbacks.
            </p>
          </div>
        </div>
      </div>

      <div className="palangal-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Rules List */}
        <div className="rules-list-container space-y-4">
          {loading ? (
             <div className="ap-card text-center py-20 text-slate-400 font-medium">Loading rules...</div>
          ) : palangal.length === 0 ? (
             <div className="ap-card text-center py-20 text-slate-400 font-medium">No rules defined yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {palangal.map((p) => {
                const isDirty = drafts[p.id] !== p.text;
                const isSaving = saving[p.id];
                const isSaved = saved[p.id];
                
                return (
                  <div key={p.id} className="ap-card">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2 flex-wrap">
                        <span className="relation-badge bg-amber-100 text-amber-700">
                          {activityOptions.find(a => a.key === p.activityKey)?.label}
                        </span>
                        <span className="relation-badge bg-orange-100 text-orange-700">
                          {relationOptions.find(r => r.key === p.relationKey)?.label}
                        </span>
                        {p.effectKey && (
                          <span className="relation-badge bg-emerald-100 text-emerald-700">
                            {effectOptions.find(e => e.key === p.effectKey)?.label}
                          </span>
                        )}
                        {p.birdId && (
                            <span className="relation-badge bg-slate-800 text-white">
                                Bird: {birdOptions.find(b => b.id === Number(p.birdId))?.label}
                            </span>
                        )}
                        {p.yamaIndex && (
                            <span className="relation-badge bg-indigo-500 text-white">
                                Yama {p.yamaIndex}
                            </span>
                        )}
                        {p.subIndex && (
                            <span className="relation-badge bg-violet-500 text-white">
                                Sub {p.subIndex}
                            </span>
                        )}
                      </div>
                      <button 
                        className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 transition-all duration-200" 
                        onClick={() => handleDelete(p.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <textarea
                      className="palangal-textarea"
                      rows={3}
                      value={drafts[p.id] ?? p.text}
                      onChange={(e) => setDrafts(d => ({ ...d, [p.id]: e.target.value }))}
                      placeholder="Prediction text details..."
                    />

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        {isSaved && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                                <IconCheck size={12} /> Synced to Vault
                            </span>
                        )}
                      </div>
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
        <div className="ap-card" style={{ position: 'sticky', top: '2rem' }}>
          <div className="ap-card-head">
            <span className="ap-eyebrow">புதிய பலன்</span>
            <h2 className="flex items-center gap-3">
              <IconList size={22} className="text-amber-500" />
              Smart Rule
            </h2>
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

            <div className="grid grid-cols-2 gap-4">
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
                placeholder="Compose the prediction narrative here..."
                required
              />
            </div>

            <button className="primary-button" type="submit" disabled={adding} style={{ marginTop: '0.5rem' }}>
              {adding ? 'Adding...' : 'Register Rule'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-medium">
              <strong className="text-slate-700 block mb-1">PRO TIP:</strong> Rules with more parameters selected (like specific Bird or Yama) will take precedence over general ones in the prediction engine.
          </div>
        </div>

      </div>
    </div>
  );
}

