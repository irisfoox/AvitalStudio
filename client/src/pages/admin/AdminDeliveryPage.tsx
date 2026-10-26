import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CakeOrder, PerfumeMatch } from '../../types';
import { motion } from 'framer-motion';

type DeliveryCategory = 'all' | 'cake' | 'perfume';

interface DeliveryItem {
  id: string;
  type: 'cake' | 'perfume';
  reference_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  description: string;
  date: string;
  status: string;
  raw: CakeOrder | PerfumeMatch;
}

const cakeStatusConfig: Record<string, { label: string; color: string }> = {
  pending:     { label: 'ממתינה', color: 'bg-amber-100 text-amber-700' },
  confirmed:   { label: 'אושרה', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'בביצוע', color: 'bg-orange-100 text-orange-700' },
  ready:       { label: 'מוכנה', color: 'bg-green-100 text-green-700' },
  delivered:   { label: 'נמסרה', color: 'bg-success/20 text-success' },
  cancelled:   { label: 'בוטלה', color: 'bg-red-100 text-red-400' },
};

const perfumeStatusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'ממתינה', color: 'bg-amber-100 text-amber-700' },
  in_review: { label: 'בבדיקה', color: 'bg-blue-100 text-blue-700' },
  matched:   { label: 'הותאמה', color: 'bg-green-100 text-green-700' },
  sent:      { label: 'נשלחה', color: 'bg-success/20 text-success' },
};

export default function AdminDeliveryPage() {
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [category, setCategory] = useState<DeliveryCategory>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DeliveryItem | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [cakeRes, perfumeRes] = await Promise.all([
        supabase.from('cake_orders').select('*').order('event_date'),
        supabase.from('perfume_matches').select('*').order('created_at', { ascending: false }),
      ]);

      const cakeItems: DeliveryItem[] = (cakeRes.data || []).map((o: CakeOrder) => ({
        id: o.id,
        type: 'cake',
        reference_number: o.reference_number,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        customer_phone: o.customer_phone || '',
        description: `${o.event_type} · ${o.theme} · ${o.cake_size}`,
        date: o.event_date,
        status: o.status,
        raw: o,
      }));

      const perfumeItems: DeliveryItem[] = (perfumeRes.data || []).map((m: PerfumeMatch) => ({
        id: m.id,
        type: 'perfume',
        reference_number: m.reference_number,
        customer_name: m.customer_name,
        customer_email: m.customer_email,
        customer_phone: m.customer_phone || '',
        description: `${m.occasion} · ${m.mood}`,
        date: m.created_at,
        status: m.status,
        raw: m,
      }));

      setItems([...cakeItems, ...perfumeItems]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = items.filter(item => {
    if (category !== 'all' && item.type !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.customer_name.toLowerCase().includes(q) ||
        item.customer_email.toLowerCase().includes(q) ||
        item.reference_number.toLowerCase().includes(q) ||
        item.customer_phone.includes(q)
      );
    }
    return true;
  });

  const updateCakeStatus = async (id: string, status: CakeOrder['status']) => {
    setSavingId(id);
    const { data } = await supabase
      .from('cake_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (data) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status, raw: data as CakeOrder } : i));
      if (selected?.id === id) setSelected(s => s ? { ...s, status, raw: data as CakeOrder } : null);
    }
    setSavingId(null);
  };

  const updatePerfumeStatus = async (id: string, status: PerfumeMatch['status']) => {
    setSavingId(id);
    const { data } = await supabase
      .from('perfume_matches')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (data) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status, raw: data as PerfumeMatch } : i));
      if (selected?.id === id) setSelected(s => s ? { ...s, status, raw: data as PerfumeMatch } : null);
    }
    setSavingId(null);
  };

  const getStatusConfig = (item: DeliveryItem) =>
    item.type === 'cake' ? cakeStatusConfig[item.status] : perfumeStatusConfig[item.status];

  const exportCSV = () => {
    const rows = [
      ['שם', 'אימייל', 'טלפון', 'סוג', 'תיאור', 'תאריך', 'סטטוס', 'מספר הזמנה'],
      ...filtered.map(i => [
        i.customer_name,
        i.customer_email,
        i.customer_phone || '-',
        i.type === 'cake' ? 'עוגה' : 'בושם',
        i.description,
        new Date(i.date).toLocaleDateString('he-IL'),
        getStatusConfig(i)?.label || i.status,
        i.reference_number,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deliveries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cakeCount = items.filter(i => i.type === 'cake').length;
  const perfumeCount = items.filter(i => i.type === 'perfume').length;
  const pendingCount = items.filter(i => ['pending', 'confirmed', 'in_progress', 'in_review', 'matched'].includes(i.status)).length;

  return (
    <div dir="rtl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-espresso">רשימת משלוחים</h1>
          <p className="font-sans text-taupe text-sm mt-1">
            {items.length} הזמנות סה"כ · {pendingCount} פעילות
          </p>
        </div>
        <button onClick={exportCSV} className="btn-outline text-sm flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          ייצא CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'סה"כ הזמנות', value: items.length, color: 'text-espresso' },
          { label: 'עוגות', value: cakeCount, color: 'text-rose' },
          { label: 'בשמים', value: perfumeCount, color: 'text-sage' },
        ].map((s, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <span className={`font-serif text-4xl font-light ${s.color}`}>{s.value}</span>
            <span className="font-sans text-sm text-taupe">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2">
          {([['all', 'הכל'], ['cake', 'עוגות'], ['perfume', 'בשמים']] as const).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setCategory(val)}
              className={`px-4 py-2 rounded-full font-sans text-sm transition-all ${
                category === val ? 'bg-rose text-white' : 'bg-white text-taupe border border-peach hover:border-rose hover:text-rose'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field text-sm"
            placeholder="חפש לפי שם, אימייל, טלפון או מספר הזמנה..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream">
                <tr>
                  {['סוג', 'שם לקוח', 'פרטי קשר', 'תיאור', 'תאריך', 'סטטוס', 'פרטים'].map(h => (
                    <th key={h} className="text-right font-sans text-xs text-taupe uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-peach">
                {filtered.map((item, i) => {
                  const cfg = getStatusConfig(item);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-sans font-medium ${
                          item.type === 'cake' ? 'bg-rose/10 text-rose' : 'bg-sage/20 text-sage'
                        }`}>
                          {item.type === 'cake' ? 'עוגה' : 'בושם'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-sans text-sm font-medium text-espresso">{item.customer_name}</p>
                        <p className="font-sans text-xs text-taupe/60">{item.reference_number}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${item.customer_email}`} className="font-sans text-xs text-rose hover:underline block">{item.customer_email}</a>
                        {item.customer_phone && (
                          <a href={`tel:${item.customer_phone}`} className="font-sans text-xs text-taupe hover:text-espresso block mt-0.5">{item.customer_phone}</a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-sans text-xs text-espresso max-w-48 truncate">{item.description}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-sans text-xs text-taupe">{new Date(item.date).toLocaleDateString('he-IL')}</span>
                      </td>
                      <td className="px-4 py-3">
                        {cfg && (
                          <span className={`text-xs px-2 py-1 rounded-full font-sans font-medium ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(item)}
                          className="font-sans text-xs text-rose hover:underline"
                        >
                          פרטים
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center font-sans text-taupe py-12">
                {search ? 'לא נמצאו תוצאות' : 'אין הזמנות'}
              </p>
            )}
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="w-full max-w-lg bg-white h-full overflow-y-auto p-8 shadow-2xl"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-sans font-medium mb-2 inline-block ${
                  selected.type === 'cake' ? 'bg-rose/10 text-rose' : 'bg-sage/20 text-sage'
                }`}>
                  {selected.type === 'cake' ? 'עוגה מעוצבת' : 'התאמת בושם'}
                </span>
                <h2 className="font-serif text-2xl text-espresso">{selected.customer_name}</h2>
                <p className="font-sans text-xs text-taupe">{selected.reference_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-taupe hover:text-espresso text-2xl w-8 h-8 flex items-center justify-center">×</button>
            </div>

            <div className="space-y-3 mb-6">
              {selected.type === 'cake' ? (() => {
                const o = selected.raw as CakeOrder;
                return [
                  { label: 'אירוע', value: o.event_type },
                  { label: 'תאריך', value: new Date(o.event_date).toLocaleDateString('he-IL') },
                  { label: 'נושא', value: o.theme },
                  { label: 'גודל', value: o.cake_size },
                  { label: 'קומות', value: String(o.tiers) },
                  { label: 'טעם', value: o.flavour || '-' },
                  { label: 'הגבלות', value: o.dietary_notes || '-' },
                  { label: 'בקשות', value: o.special_requests || '-' },
                  { label: 'תקציב', value: o.budget_range || '-' },
                  { label: 'אימייל', value: o.customer_email },
                  { label: 'טלפון', value: o.customer_phone || '-' },
                  { label: 'הערות', value: o.admin_notes || '-' },
                ].map(item => (
                  <div key={item.label} className="flex gap-3">
                    <span className="font-sans text-xs text-taupe w-20 shrink-0 pt-0.5">{item.label}</span>
                    <span className="font-sans text-sm text-espresso">{item.value}</span>
                  </div>
                ));
              })() : (() => {
                const m = selected.raw as PerfumeMatch;
                return [
                  { label: 'אירוע', value: m.occasion },
                  { label: 'מצב רוח', value: m.mood },
                  { label: 'עוצמה', value: m.preferred_intensity },
                  { label: 'משפחות', value: m.preferred_families?.join(', ') || '-' },
                  { label: 'להימנע', value: m.avoid_notes || '-' },
                  { label: 'תקציב', value: m.budget_range || '-' },
                  { label: 'מידע נוסף', value: m.additional_info || '-' },
                  { label: 'אימייל', value: m.customer_email },
                  { label: 'טלפון', value: m.customer_phone || '-' },
                  { label: 'הערות', value: m.admin_notes || '-' },
                ].map(item => (
                  <div key={item.label} className="flex gap-3">
                    <span className="font-sans text-xs text-taupe w-20 shrink-0 pt-0.5">{item.label}</span>
                    <span className="font-sans text-sm text-espresso">{item.value}</span>
                  </div>
                ));
              })()}
            </div>

            <div className="border-t border-peach pt-4">
              <label className="label mb-2 block">עדכון סטטוס</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(selected.type === 'cake' ? cakeStatusConfig : perfumeStatusConfig).map(([val, cfg]) => (
                  <button
                    key={val}
                    disabled={savingId === selected.id}
                    onClick={() =>
                      selected.type === 'cake'
                        ? updateCakeStatus(selected.id, val as CakeOrder['status'])
                        : updatePerfumeStatus(selected.id, val as PerfumeMatch['status'])
                    }
                    className={`text-xs px-3 py-1.5 rounded-full font-sans font-medium transition-all ${
                      selected.status === val
                        ? cfg.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-cream text-taupe hover:bg-cream-dark'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <a href={`mailto:${selected.customer_email}`} className="btn-primary text-sm">
                  שלח אימייל
                </a>
                {selected.customer_phone && (
                  <a href={`tel:${selected.customer_phone}`} className="btn-outline text-sm">
                    התקשר
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
