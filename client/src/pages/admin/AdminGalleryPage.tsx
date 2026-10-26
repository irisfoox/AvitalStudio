import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { GalleryItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const categoryLabel: Record<string, string> = {
  painting: 'ציור שמן',
  watercolor: 'צבעי מים',
  mixed_media: 'טכניקה מעורבת',
  cake: 'עוגה מעוצבת',
  other: 'אחר',
};

type ViewMode = 'grid' | 'list';

const emptyForm = { title: '', description: '', category: 'painting', image_url: '', is_featured: false };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'painting', image_url: '', is_featured: false, sort_order: 0 });
  const [savingEdit, setSavingEdit] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    supabase.from('gallery_items').select('*').order('sort_order').then(({ data }) => {
      if (data) setItems(data as GalleryItem[]);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPreviewUrl(form.image_url), 400);
    return () => clearTimeout(t);
  }, [form.image_url]);

  const addItem = async () => {
    if (!form.title || !form.image_url) return;
    setLoading(true);
    const { data } = await supabase.from('gallery_items').insert(form).select().single();
    if (data) setItems(prev => [data as GalleryItem, ...prev]);
    setForm({ ...emptyForm });
    setPreviewUrl('');
    setAdding(false);
    setLoading(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('למחוק פריט זה?')) return;
    await supabase.from('gallery_items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleFeatured = async (item: GalleryItem) => {
    const val = !item.is_featured;
    await supabase.from('gallery_items').update({ is_featured: val }).eq('id', item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_featured: val } : i));
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setEditForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      image_url: item.image_url,
      is_featured: item.is_featured,
      sort_order: item.sort_order,
    });
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setSavingEdit(true);
    const { data } = await supabase
      .from('gallery_items')
      .update(editForm)
      .eq('id', editItem.id)
      .select()
      .single();
    if (data) setItems(prev => prev.map(i => i.id === editItem.id ? data as GalleryItem : i));
    setEditItem(null);
    setSavingEdit(false);
  };

  const filteredItems = filterCategory === 'all'
    ? items
    : filterCategory === 'featured'
    ? items.filter(i => i.is_featured)
    : items.filter(i => i.category === filterCategory);

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl text-espresso">ניהול גלריה</h1>
          <p className="font-sans text-taupe text-sm mt-1">{items.length} פריטים · {items.filter(i => i.is_featured).length} מובלטים</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary text-sm self-start sm:self-auto">
          + הוסף תמונה
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-6 mb-6"
          >
            <h2 className="font-serif text-xl text-espresso mb-5">הוספת תמונה חדשה</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="label">כותרת *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="input-field"
                    placeholder="שם היצירה"
                  />
                </div>
                <div>
                  <label className="label">קטגוריה</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    {Object.entries(categoryLabel).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">כתובת תמונה (URL) *</label>
                  <input
                    value={form.image_url}
                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                    className="input-field"
                    placeholder="https://images.pexels.com/..."
                  />
                  <p className="font-sans text-xs text-taupe mt-1">הדבק כתובת URL של תמונה</p>
                </div>
                <div>
                  <label className="label">תיאור</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="תיאור קצר של היצירה..."
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-rose"
                  />
                  <span className="font-sans text-sm text-taupe">הצג בעמוד הבית</span>
                </label>
              </div>

              <div>
                <label className="label">תצוגה מקדימה</label>
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-cream border border-peach flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="תצוגה מקדימה"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewUrl('')}
                    />
                  ) : (
                    <div className="text-center px-4">
                      <svg className="w-12 h-12 text-peach mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="font-sans text-xs text-taupe">הזן כתובת URL לתצוגה מקדימה</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5 border-t border-peach pt-5">
              <button
                onClick={addItem}
                disabled={loading || !form.title || !form.image_url}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {loading ? 'שומר...' : 'הוסף לגלריה'}
              </button>
              <button onClick={() => { setAdding(false); setForm({ ...emptyForm }); setPreviewUrl(''); }} className="btn-ghost text-sm">
                ביטול
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {[['all', 'הכל'], ['featured', 'מובלטים'], ...Object.entries(categoryLabel)].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilterCategory(val)}
              className={`px-4 py-1.5 rounded-full font-sans text-xs transition-all ${
                filterCategory === val ? 'bg-rose text-white' : 'bg-white text-taupe border border-peach hover:border-rose hover:text-rose'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-rose text-white' : 'text-taupe hover:bg-cream'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V2zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-rose text-white' : 'text-taupe hover:bg-cream'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="card overflow-hidden group"
            >
              <div className="relative aspect-square overflow-hidden bg-cream">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                  loading="lazy"
                />
                {item.is_featured && (
                  <div className="absolute top-2 right-2 bg-rose text-white text-xs px-2 py-0.5 rounded-full font-sans">
                    מובלט
                  </div>
                )}
                <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(item)}
                    className="bg-white text-espresso text-xs px-3 py-1.5 rounded-full font-sans font-medium hover:bg-cream"
                  >
                    ערוך
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-sans font-medium hover:bg-red-600"
                  >
                    מחק
                  </button>
                </div>
              </div>
              <div className="p-3">
                <span className="font-sans text-xs text-rose font-medium">{categoryLabel[item.category]}</span>
                <h3 className="font-serif text-sm mt-0.5 text-espresso truncate">{item.title}</h3>
                <button
                  onClick={() => toggleFeatured(item)}
                  className="font-sans text-xs text-taupe hover:text-espresso mt-1.5"
                >
                  {item.is_featured ? '★ הסר הבלטה' : '☆ הבלט'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                {['תמונה', 'כותרת', 'קטגוריה', 'מובלט', 'פעולות'].map(h => (
                  <th key={h} className="text-right font-sans text-xs text-taupe uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-peach">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-4 py-3">
                    <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm text-espresso font-medium">{item.title}</p>
                    {item.description && <p className="font-sans text-xs text-taupe truncate max-w-48">{item.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-xs text-rose font-medium">{categoryLabel[item.category]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`font-sans text-xs ${item.is_featured ? 'text-rose' : 'text-taupe hover:text-espresso'}`}
                    >
                      {item.is_featured ? '★ כן' : '☆ לא'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(item)} className="font-sans text-xs text-rose hover:underline">ערוך</button>
                      <button onClick={() => deleteItem(item.id)} className="font-sans text-xs text-red-400 hover:text-red-600 hover:underline">מחק</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <p className="text-center font-sans text-taupe py-12">אין פריטים</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {editItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setEditItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl text-espresso">עריכת פריט</h2>
                <button onClick={() => setEditItem(null)} className="text-taupe hover:text-espresso text-2xl w-8 h-8 flex items-center justify-center">×</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="label">כותרת *</label>
                    <input
                      value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">קטגוריה</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                      className="input-field"
                    >
                      {Object.entries(categoryLabel).map(([val, lbl]) => (
                        <option key={val} value={val}>{lbl}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">כתובת תמונה (URL)</label>
                    <input
                      value={editForm.image_url}
                      onChange={e => setEditForm({ ...editForm, image_url: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">תיאור</label>
                    <textarea
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      className="input-field resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="label">סדר תצוגה</label>
                    <input
                      type="number"
                      value={editForm.sort_order}
                      onChange={e => setEditForm({ ...editForm, sort_order: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_featured}
                      onChange={e => setEditForm({ ...editForm, is_featured: e.target.checked })}
                      className="w-4 h-4 accent-rose"
                    />
                    <span className="font-sans text-sm text-taupe">הצג בעמוד הבית</span>
                  </label>
                </div>
                <div>
                  <label className="label">תצוגה מקדימה</label>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream border border-peach">
                    <img
                      src={editForm.image_url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-5 border-t border-peach">
                <button onClick={saveEdit} disabled={savingEdit} className="btn-primary text-sm">
                  {savingEdit ? 'שומר...' : 'שמור שינויים'}
                </button>
                <button onClick={() => setEditItem(null)} className="btn-ghost text-sm">ביטול</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
