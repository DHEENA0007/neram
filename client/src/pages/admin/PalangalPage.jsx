import { useEffect, useState, useMemo } from 'react';
import { loadPalangal, savePalangal, createPalangal, deletePalangal } from '../../api.js';
import { birdOptions, activityOptions, relationOptions, effectOptions } from '../../shared/constants.js';
import { useAuth } from '../../auth.jsx';
import { IconCheck, IconInfo, IconBan, IconList, IconSearch, IconZap } from '../../components/Icons.jsx';

const PAGE_SIZE = 10;

export function PalangalPage() {
  const { language } = useAuth();
  const [palangal, setPalangal] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  
  const [newRule, setNewRule] = useState({ 
    activityKey: 'ruling', relationKey: 'friend', effectKey: '', 
    birdId: '', yamaIndex: '', subIndex: '', text: '' 
  });
  const [adding, setAdding] = useState(false);

  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved]   = useState({});

  async function refresh() {
    setLoading(true);
    try {
      const d = await loadPalangal();
      const list = d.palangal || [];
      list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setPalangal(list);
      const init = {};
      for (const p of list) init[p.id] = p.text;
      setDrafts(init);
    } catch (err) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return palangal.filter(p => 
      p.text.toLowerCase().includes(search.toLowerCase()) ||
      activityOptions.find(a => a.key === p.activityKey)?.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [palangal, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newRule.text.trim()) return;
    setAdding(true);
    try {
      await createPalangal(newRule);
      setNewRule({ ...newRule, text: '' });
      await refresh();
      setPage(1);
    } catch (err) { alert(err.message); }
    finally { setAdding(false); }
  }

  async function handleUpdate(id) {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      const updated = await savePalangal(id, { text: drafts[id] });
      setPalangal(prev => prev.map(p => p.id === id ? updated.palangal : p));
      setSaved(s => ({ ...s, [id]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2000);
    } catch (err) { alert(err.message); }
    finally { setSaving(s => ({ ...s, [id]: false })); }
  }

  async function handleDelete(id) {
    if (!window.confirm(language === 'en' ? 'Delete this rule?' : 'இந்தப் பலன் நீக்கலாமா?')) return;
    try { await deletePalangal(id); await refresh(); }
    catch (err) { alert(err.message); }
  }

  const T_HEAD = language === 'en' ? 'பலன் மேலாண்மை · Palangal' : 'பலன் மேலாண்மை';
  const T_TITLE = language === 'en' ? 'Manage Palangal' : 'பலன்கள் மேலாண்மை';
  const T_SEARCH = language === 'en' ? 'Search palangal...' : 'தேடுக...';
  const T_NEW = language === 'en' ? 'New Palan' : 'புதிய பலன்';
  const T_REG = language === 'en' ? 'Register prediction' : 'பலனை பதிவு செய்';
  const T_SAVE = language === 'en' ? 'Save Palan' : 'சேமிக்கவும்';

  return (
    <div className="admin-page">
      <div className="admin-page-header mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-1">{T_HEAD}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{T_TITLE}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="text-input pl-10 h-10 w-64 text-sm" 
              placeholder={T_SEARCH}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-8 items-start">
        
        {/* Rules List */}
        <div className="flex-1 min-w-0 space-y-4">
          {loading ? (
             <div className="ap-card text-center py-20 text-slate-300 font-black uppercase tracking-widest text-xs">Syncing...</div>
          ) : paginated.length === 0 ? (
             <div className="ap-card text-center py-20 text-slate-300 font-black uppercase tracking-widest text-xs">No data.</div>
          ) : (
            <>
              <div className="grid gap-4">
                {paginated.map((p) => {
                  const isDirty = drafts[p.id] !== p.text;
                  const isSaving = saving[p.id];
                  const bObj = birdOptions.find(b => b.id === Number(p.birdId));
                  const bird = language === 'en' ? bObj?.label : bObj?.tamil;
                  return (
                    <div key={p.id} className="ap-card p-6 border border-slate-100">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 rounded bg-amber-50 text-amber-600 text-[11px] font-black uppercase">
                          {language === 'en' ? activityOptions.find(a => a.key === p.activityKey)?.label : activityOptions.find(a => a.key === p.activityKey)?.tamil}
                        </span>
                        <span className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-black uppercase">
                          {language === 'en' ? relationOptions.find(r => r.key === p.relationKey)?.label : relationOptions.find(r => r.key === p.relationKey)?.tamil}
                        </span>
                        {p.effectKey && <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase">
                          {language === 'en' ? effectOptions.find(e => e.key === p.effectKey)?.label : effectOptions.find(e => e.key === p.effectKey)?.tamil}
                        </span>}
                        {bird && <span className="px-3 py-1 rounded bg-slate-900 text-white text-[11px] font-black uppercase">{bird}</span>}
                      </div>

                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed focus:bg-white focus:border-amber-400 outline-none transition-all"
                        rows={2}
                        value={drafts[p.id] ?? p.text}
                        onChange={(e) => setDrafts(d => ({ ...d, [p.id]: e.target.value }))}
                      />

                      <div className="flex items-center justify-between mt-4">
                        <button onClick={() => handleDelete(p.id)} className="text-[11px] font-black uppercase text-rose-500 hover:underline">
                          {language === 'en' ? 'Delete' : 'நீக்கு'}
                        </button>
                        <div className="flex items-center gap-3">
                           {saved[p.id] && <span className="text-[11px] font-black uppercase text-emerald-500">Synced</span>}
                           <button
                             className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${isDirty ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/10' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
                             onClick={() => handleUpdate(p.id)}
                             disabled={isSaving || !isDirty}
                           >
                             {isSaving ? '...' : (language === 'en' ? 'Update' : 'புதுப்பிக்கவும்')}
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                   <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 disabled:opacity-30">‹</button>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest mx-4 whitespace-nowrap">{language === 'en' ? `Page ${page} of ${totalPages}` : `பக்கம் ${page} இல் ${totalPages}`}</span>
                   <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 disabled:opacity-30">›</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Rule Panel */}
        <div className="w-80 shrink-0 ap-card p-6 border border-slate-100 sticky top-8">
          <div className="mb-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <IconZap size={20} className="text-amber-500" />
              {T_NEW}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{T_REG}</p>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Activity' : 'செயல்பாடு'}</label>
                  <select className="text-input h-10 text-sm font-bold" value={newRule.activityKey} onChange={e => setNewRule({...newRule, activityKey: e.target.value})}>
                    {activityOptions.map(a => <option key={a.key} value={a.key}>{language === 'en' ? a.label : a.tamil}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Relation' : 'உறவு'}</label>
                  <select className="text-input h-10 text-sm font-bold" value={newRule.relationKey} onChange={e => setNewRule({...newRule, relationKey: e.target.value})}>
                    {relationOptions.map(r => <option key={r.key} value={r.key}>{language === 'en' ? r.label : r.tamil}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Effect' : 'விளைவு'}</label>
                     <select className="text-input h-10 text-sm font-bold" value={newRule.effectKey} onChange={e => setNewRule({...newRule, effectKey: e.target.value})}>
                        <option value="">{language === 'en' ? 'Any' : 'அனைத்தும்'}</option>
                        {effectOptions.map(e => <option key={e.key} value={e.key}>{language === 'en' ? e.label : e.tamil}</option>)}
                     </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Bird' : 'பட்சி'}</label>
                     <select className="text-input h-10 text-sm font-bold" value={newRule.birdId} onChange={e => setNewRule({...newRule, birdId: e.target.value})}>
                        <option value="">{language === 'en' ? 'Any' : 'அனைத்தும்'}</option>
                        {birdOptions.map(b => <option key={b.id} value={b.id}>{language === 'en' ? b.label : b.tamil}</option>)}
                     </select>
                   </div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{language === 'en' ? 'Palan Text' : 'பலன் உரை'}</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm leading-relaxed focus:bg-white focus:border-amber-400 outline-none transition-all" 
                rows={4} 
                value={newRule.text} 
                onChange={e => setNewRule({...newRule, text: e.target.value})}
                placeholder={language === 'en' ? 'Enter text...' : 'உரையை உள்ளிடவும்...'}
                required
              />
            </div>

            <button className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all" type="submit" disabled={adding}>
              {adding ? '...' : T_SAVE}
            </button>
          </form>

          <div className="mt-8 p-5 bg-amber-50 rounded-[2rem] border border-amber-100/50">
              <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                {language === 'en' ? 'Rules with more specifics take precedence.' : 'அதிக விவரங்களைக் கொண்ட விதிகள் முன்னுரிமை பெறும்.'}
              </p>
          </div>
        </div>

      </div>
    </div>
  );
}
