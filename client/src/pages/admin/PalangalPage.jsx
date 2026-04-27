import { useEffect, useState, useMemo } from 'react';
import { loadPalangal, savePalangal, createPalangal, deletePalangal } from '../../api.js';
import { birdOptions, activityOptions, relationOptions, effectOptions } from '../../shared/constants.js';
import { useAuth } from '../../auth.jsx';
import { IconCheck, IconInfo, IconBan, IconList, IconSearch, IconZap, IconX } from '../../components/Icons.jsx';

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
      <div className="admin-page-header mb-12">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">{T_HEAD}</p>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">{T_TITLE}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="text-input pl-12 h-14 w-80 text-base" 
              placeholder={T_SEARCH}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-12 items-start h-[calc(100vh-250px)]">
        
        {/* Rules List */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6 pb-12">
            {loading ? (
              <div className="ap-card text-center py-32 text-slate-300 font-black uppercase tracking-[0.3em] text-sm">Syncing Data Intelligence...</div>
            ) : paginated.length === 0 ? (
              <div className="ap-card text-center py-32 text-slate-300 font-black uppercase tracking-[0.3em] text-sm">No rules identified.</div>
            ) : (
              paginated.map((p) => {
                const isDirty = drafts[p.id] !== p.text;
                const isSaving = saving[p.id];
                const bObj = birdOptions.find(b => b.id === Number(p.birdId));
                const bird = language === 'en' ? bObj?.label : bObj?.tamil;
                return (
                  <div key={p.id} className="ap-card p-10 border border-slate-100 group hover:border-amber-200 transition-all">
                    <div className="flex flex-wrap gap-3 mb-6">
                      <span className="px-4 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest">
                        {language === 'en' ? activityOptions.find(a => a.key === p.activityKey)?.label : activityOptions.find(a => a.key === p.activityKey)?.tamil}
                      </span>
                      <span className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest">
                        {language === 'en' ? relationOptions.find(r => r.key === p.relationKey)?.label : relationOptions.find(r => r.key === p.relationKey)?.tamil}
                      </span>
                      {p.effectKey && <span className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest">
                        {language === 'en' ? effectOptions.find(e => e.key === p.effectKey)?.label : effectOptions.find(e => e.key === p.effectKey)?.tamil}
                      </span>}
                      {bird && <span className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest">{bird}</span>}
                    </div>

                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-base font-medium leading-relaxed focus:bg-white focus:border-amber-400 outline-none transition-all"
                      rows={3}
                      value={drafts[p.id] ?? p.text}
                      onChange={(e) => setDrafts(d => ({ ...d, [p.id]: e.target.value }))}
                    />

                    <div className="flex items-center justify-between mt-8">
                      <button onClick={() => handleDelete(p.id)} className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Delete Permanently' : 'நீக்கு'}
                      </button>
                      <div className="flex items-center gap-4">
                         {saved[p.id] && <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><IconCheck size={14}/> Synced</span>}
                         <button
                           className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isDirty ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 active:scale-95' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}
                           onClick={() => handleUpdate(p.id)}
                           disabled={isSaving || !isDirty}
                         >
                           {isSaving ? '...' : (language === 'en' ? 'Update & Sync' : 'புதுப்பிக்கவும்')}
                         </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-10 border-t border-slate-50">
               <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="w-14 h-14 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm disabled:opacity-30 transition-all">‹</button>
               <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mx-6 whitespace-nowrap">{language === 'en' ? `Page ${page} of ${totalPages}` : `பக்கம் ${page} இல் ${totalPages}`}</span>
               <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="w-14 h-14 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm disabled:opacity-30 transition-all">›</button>
            </div>
          )}
        </div>

        {/* Create Rule Panel */}
        <div className="w-[450px] shrink-0 ap-card p-12 border border-slate-100 flex flex-col h-full overflow-hidden bg-white">
          <div className="mb-10 shrink-0">
            <h2 className="text-4xl font-black flex items-center gap-4 text-slate-900">
              <IconZap size={32} className="text-amber-500" />
              {T_NEW}
            </h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">{T_REG}</p>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6">
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 ml-1">{language === 'en' ? 'Primary Activity' : 'செயல்பாடு'}</label>
                  <select className="text-input h-14 px-6 text-base font-bold bg-slate-50" value={newRule.activityKey} onChange={e => setNewRule({...newRule, activityKey: e.target.value})}>
                    {activityOptions.map(a => <option key={a.key} value={a.key}>{language === 'en' ? a.label : a.tamil}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 ml-1">{language === 'en' ? 'Bird Relation' : 'உறவு'}</label>
                  <select className="text-input h-14 px-6 text-base font-bold bg-slate-50" value={newRule.relationKey} onChange={e => setNewRule({...newRule, relationKey: e.target.value})}>
                    {relationOptions.map(r => <option key={r.key} value={r.key}>{language === 'en' ? r.label : r.tamil}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div className="flex flex-col gap-2.5">
                     <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 ml-1">{language === 'en' ? 'Effect' : 'விளைவு'}</label>
                     <select className="text-input h-14 px-6 text-base font-bold bg-slate-50" value={newRule.effectKey} onChange={e => setNewRule({...newRule, effectKey: e.target.value})}>
                        <option value="">{language === 'en' ? 'Any' : 'அனைத்தும்'}</option>
                        {effectOptions.map(e => <option key={e.key} value={e.key}>{language === 'en' ? e.label : e.tamil}</option>)}
                     </select>
                   </div>
                   <div className="flex flex-col gap-2.5">
                     <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 ml-1">{language === 'en' ? 'Bird' : 'பட்சி'}</label>
                     <select className="text-input h-14 px-6 text-base font-bold bg-slate-50" value={newRule.birdId} onChange={e => setNewRule({...newRule, birdId: e.target.value})}>
                        <option value="">{language === 'en' ? 'Any' : 'அனைத்தும்'}</option>
                        {birdOptions.map(b => <option key={b.id} value={b.id}>{language === 'en' ? b.label : b.tamil}</option>)}
                     </select>
                   </div>
                </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 ml-1">{language === 'en' ? 'Palan Text' : 'பலன் உரை'}</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 text-base leading-relaxed focus:bg-white focus:border-amber-400 outline-none transition-all font-medium" 
                rows={6} 
                value={newRule.text} 
                onChange={e => setNewRule({...newRule, text: e.target.value})}
                placeholder={language === 'en' ? 'Enter prediction text...' : 'உரையை உள்ளிடவும்...'}
                required
              />
            </div>

            <button className="w-full py-6 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-slate-900/20 hover:bg-black active:scale-[0.98] transition-all" type="submit" disabled={adding}>
              {adding ? '...' : T_SAVE}
            </button>

            <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100/50 mt-4">
                <p className="text-xs text-amber-700 font-bold leading-relaxed flex items-start gap-3">
                  <IconInfo size={20} className="shrink-0 mt-0.5" />
                  <span>{language === 'en' ? 'Advanced rules mapping specific conditions will automatically take precedence over generic ones during calculation.' : 'கணக்கீட்டின் போது பொதுவான விதிகளை விட குறிப்பிட்ட நிபந்தனைகளைத் திரட்டும் மேம்பட்ட விதிகள் தானாகவே முன்னுரிமை பெறும்.'}</span>
                </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
