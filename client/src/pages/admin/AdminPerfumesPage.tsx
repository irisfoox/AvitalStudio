import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Perfume, PerfumeMatch } from '../../types';
import { motion } from 'framer-motion';

const scentFamilyLabel: Record<string, string> = {
  floral: 'פרחוני', woody: 'עצי', oriental: 'מזרחי', fresh: 'טרי',
  citrus: 'הדרי', gourmand: 'גורמה', aquatic: 'ימי', spicy: 'תבלינים',
};

const matchStatusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'ממתינה', color: 'bg-amber-100 text-amber-700' },
  in_review: { label: 'בבדיקה', color: 'bg-blue-100 text-blue-700' },
  matched:   { label: 'הותאמה', color: 'bg-green-100 text-green-700' },
  sent:      { label: 'נשלחה', color: 'bg-success/20 text-success' },
};

type Tab = 'catalog' | 'requests';

export default function AdminPerfumesPage() {
  const [tab, setTab] = useState<Tab>('requests');
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [matches, setMatches] = useState<PerfumeMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<PerfumeMatch | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerfume, setNewPerfume] = useState({
    name: '', brand: 'Studio Avital', description: '', scent_family: 'floral',
    notes_top: '', notes_middle: '', notes_base: '', image_url: '',
  });
  const [addingPerfume, setAddingPerfume] = useState(false);

  useEffect(() => {
    supabase.from('perfumes').select('*').order('sort_order').then(({ data }) => {
      if (data) setPerfumes(data as Perfume[]);
    });
    supabase.from('perfume_matches').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setMatches(data as PerfumeMatch[]);
    });
  }, []);

  const updateMatchStatus = async (id: string, status: PerfumeMatch['status']) => {
    setSavingId(id);
    const { data } = await supabase.from('perfume_matches').update({ status }).eq('id', id).select().single();
    if (data) {
      setMatches((prev) => prev.map((m) => (m.id === id ? data as PerfumeMatch : m)));
      if (selectedMatch?.id === id) setSelectedMatch(data as PerfumeMatch);
    }
    setSavingId(null);
  };

  const saveMatchNotes = async (id: string) => {
    setSavingId(id);
    const { data } = await supabase.from('perfume_matches').update({ admin_notes: adminNotes }).eq('id', id).select().single();
    if (data) {
      setMatches((prev) => prev.map((m) => (m.id === id ? data as PerfumeMatch : m)));
      setSelectedMatch(data as PerfumeMatch);
    }
    setSavingId(null);
  };

  const addPerfume = async () => {
    if (!newPerfume.name) return;
    setAddingPerfume(true);
    const { data } = await supabase.from('perfumes').insert(newPerfume).select().single();
    if (data) setPerfumes((prev) => [...prev, data as Perfume]);
    setNewPerfume({ name: '', brand: 'Studio Avital', description: '', scent_family: 'floral', notes_top: '', notes_middle: '', notes_base: '', image_url: '' });
    setShowAddForm(false);
    setAddingPerfume(false);
  };

  const deletePerfume = async (id: string) => {
    if (!confirm('למחוק בושם זה?')) return;
    await supabase.from('perfumes').delete().eq('id', id);
    setPerfumes((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-4xl text-espresso">ניהול בשמים</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('requests')}
          className={`px-5 py-2 rounded-full font-sans text-sm transition-all ${tab === 'requests' ? 'bg-rose text-white' : 'bg-white text-taupe border border-peach hover:border-rose'}`}
        >
          פניות התאמה ({matches.filter((m) => m.status === 'pending').length} חדשות)
        </button>
        <button
          onClick={() => setTab('catalog')}
          className={`px-5 py-2 rounded-full font-sans text-sm transition-all ${tab === 'catalog' ? 'bg-rose text-white' : 'bg-white text-taupe border border-peach hover:border-rose'}`}
        >
          קטלוג בשמים ({perfumes.length})
        </button>
      </div>

      {tab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card overflow-hidden">
            <div className="divide-y divide-peach">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => { setSelectedMatch(match); setAdminNotes(match.admin_notes || ''); }}
                  className={`w-full text-right p-4 hover:bg-cream transition-colors ${selectedMatch?.id === match.id ? 'bg-cream' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-sans text-sm font-medium text-espresso">{match.customer_name}</p>
                      <p className="font-sans text-xs text-taupe">{match.occasion} · {match.mood}</p>
                      <p className="font-sans text-xs text-taupe/60 mt-1">{new Date(match.created_at).toLocaleDateString('he-IL')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-sans shrink-0 ${matchStatusConfig[match.status]?.color}`}>
                      {matchStatusConfig[match.status]?.label}
                    </span>
                  </div>
                </button>
              ))}
              {matches.length === 0 && (
                <p className="font-sans text-taupe text-center py-12">אין פניות עדיין</p>
              )}
            </div>
          </div>

          {selectedMatch ? (
            <div className="card p-6 overflow-y-auto max-h-[70vh]" dir="rtl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-serif text-xl text-espresso">{selectedMatch.customer_name}</h2>
                  <a href={`mailto:${selectedMatch.customer_email}`} className="font-sans text-xs text-rose hover:underline">{selectedMatch.customer_email}</a>
                </div>
                <select
                  value={selectedMatch.status}
                  onChange={(e) => updateMatchStatus(selectedMatch.id, e.target.value as PerfumeMatch['status'])}
                  disabled={savingId === selectedMatch.id}
                  className={`text-xs px-2 py-1 rounded-full font-sans font-medium border-0 cursor-pointer ${matchStatusConfig[selectedMatch.status]?.color}`}
                >
                  {Object.entries(matchStatusConfig).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'אירוע', value: selectedMatch.occasion },
                  { label: 'מצב רוח', value: selectedMatch.mood },
                  { label: 'עוצמה', value: selectedMatch.preferred_intensity },
                  { label: 'משפחות', value: selectedMatch.preferred_families?.join(', ') || '-' },
                  { label: 'להימנע', value: selectedMatch.avoid_notes || '-' },
                  { label: 'תקציב', value: selectedMatch.budget_range || '-' },
                  { label: 'מידע נוסף', value: selectedMatch.additional_info || '-' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="font-sans text-xs text-taupe w-20 shrink-0 pt-0.5">{item.label}</span>
                    <span className="font-sans text-sm text-espresso">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-peach pt-4">
                <label className="label">המלצת בשמים / הערות</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="input-field resize-none mb-3" placeholder="רשמי כאן את הבשמים המומלצים והסיבות..." />
                <div className="flex gap-3">
                  <button onClick={() => saveMatchNotes(selectedMatch.id)} disabled={savingId === selectedMatch.id} className="btn-primary text-sm">
                    שמור
                  </button>
                  <a href={`mailto:${selectedMatch.customer_email}`} className="btn-outline text-sm">
                    שלח תשובה
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 flex items-center justify-center text-taupe">
              <p className="font-sans text-sm">בחרי פנייה לצפייה בפרטים</p>
            </div>
          )}
        </div>
      )}

      {tab === 'catalog' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">+ הוסף בושם</button>
          </div>

          {showAddForm && (
            <div dir="rtl" className="card p-6 mb-6">
              <h2 className="font-serif text-xl text-espresso mb-4">בושם חדש</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">שם *</label>
                  <input value={newPerfume.name} onChange={(e) => setNewPerfume({ ...newPerfume, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">מותג</label>
                  <input value={newPerfume.brand} onChange={(e) => setNewPerfume({ ...newPerfume, brand: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">משפחת ריח</label>
                  <select value={newPerfume.scent_family} onChange={(e) => setNewPerfume({ ...newPerfume, scent_family: e.target.value })} className="input-field">
                    {Object.entries(scentFamilyLabel).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">כתובת תמונה (URL)</label>
                  <input value={newPerfume.image_url} onChange={(e) => setNewPerfume({ ...newPerfume, image_url: e.target.value })} className="input-field" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="label">תיאור</label>
                  <textarea value={newPerfume.description} onChange={(e) => setNewPerfume({ ...newPerfume, description: e.target.value })} rows={2} className="input-field resize-none" />
                </div>
                <div>
                  <label className="label">נוטות עליונות</label>
                  <input value={newPerfume.notes_top} onChange={(e) => setNewPerfume({ ...newPerfume, notes_top: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">נוטות לב</label>
                  <input value={newPerfume.notes_middle} onChange={(e) => setNewPerfume({ ...newPerfume, notes_middle: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">נוטות בסיס</label>
                  <input value={newPerfume.notes_base} onChange={(e) => setNewPerfume({ ...newPerfume, notes_base: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={addPerfume} disabled={addingPerfume} className="btn-primary text-sm">{addingPerfume ? 'שומר...' : 'הוסף'}</button>
                <button onClick={() => setShowAddForm(false)} className="btn-ghost text-sm">ביטול</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
            {perfumes.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
                {p.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <span className="font-sans text-xs text-rose font-medium">{scentFamilyLabel[p.scent_family]}</span>
                  <h3 className="font-serif text-lg mt-0.5 text-espresso">{p.name}</h3>
                  <p className="font-sans text-xs text-taupe mt-1 line-clamp-2">{p.description}</p>
                  <button onClick={() => deletePerfume(p.id)} className="font-sans text-xs text-red-400 hover:text-red-600 mt-3">מחק</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
