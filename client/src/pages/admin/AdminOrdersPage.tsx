import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CakeOrder } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:     { label: 'ממתינה', color: 'bg-amber-100 text-amber-700' },
  confirmed:   { label: 'אושרה', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'בביצוע', color: 'bg-orange-100 text-orange-700' },
  ready:       { label: 'מוכנה', color: 'bg-green-100 text-green-700' },
  delivered:   { label: 'נמסרה', color: 'bg-success/20 text-success' },
  cancelled:   { label: 'בוטלה', color: 'bg-red-100 text-red-400' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CakeOrder[]>([]);
  const [selected, setSelected] = useState<CakeOrder | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('cake_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as CakeOrder[]);
      });
  }, []);

  const openOrder = (order: CakeOrder) => {
    setSelected(order);
    setAdminNotes(order.admin_notes || '');
  };

  const updateOrder = async (id: string, updates: Partial<CakeOrder>) => {
    setSavingId(id);
    const { data } = await supabase
      .from('cake_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (data) {
      setOrders((prev) => prev.map((o) => (o.id === id ? data as CakeOrder : o)));
      if (selected?.id === id) setSelected(data as CakeOrder);
    }
    setSavingId(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-espresso">הזמנות עוגה</h1>
        <p className="font-sans text-taupe text-sm mt-1">{orders.length} הזמנות סה"כ</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead className="bg-cream">
              <tr>
                {['מספר הזמנה', 'שם לקוח', 'אירוע', 'תאריך', 'סטטוס', 'פעולות'].map((h) => (
                  <th key={h} className="text-right font-sans text-xs text-taupe uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-peach">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-4 py-3 font-sans text-xs text-taupe">{order.reference_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm text-espresso">{order.customer_name}</p>
                    <p className="font-sans text-xs text-taupe">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-espresso">{order.event_type}</td>
                  <td className="px-4 py-3 font-sans text-sm text-taupe">{new Date(order.event_date).toLocaleDateString('he-IL')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrder(order.id, { status: e.target.value as CakeOrder['status'] })}
                      className={`text-xs px-2 py-1 rounded-full font-sans font-medium border-0 cursor-pointer ${statusConfig[order.status]?.color}`}
                      disabled={savingId === order.id}
                    >
                      {Object.entries(statusConfig).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openOrder(order)}
                      className="font-sans text-xs text-rose hover:underline"
                    >
                      פרטים
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center font-sans text-taupe py-12">אין הזמנות עדיין</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full max-w-lg bg-white h-full overflow-y-auto p-8 shadow-2xl"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-serif text-2xl text-espresso">{selected.customer_name}</h2>
                  <span className="font-sans text-xs text-taupe">{selected.reference_number}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-taupe hover:text-espresso text-2xl">×</button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'אימייל', value: selected.customer_email },
                  { label: 'טלפון', value: selected.customer_phone || '-' },
                  { label: 'סוג אירוע', value: selected.event_type },
                  { label: 'תאריך', value: new Date(selected.event_date).toLocaleDateString('he-IL') },
                  { label: 'נושא', value: selected.theme },
                  { label: 'גודל', value: selected.cake_size },
                  { label: 'קומות', value: String(selected.tiers) },
                  { label: 'טעם', value: selected.flavour || '-' },
                  { label: 'הגבלות תזונה', value: selected.dietary_notes || '-' },
                  { label: 'תקציב', value: selected.budget_range || '-' },
                  { label: 'בקשות מיוחדות', value: selected.special_requests || '-' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="font-sans text-xs text-taupe w-28 shrink-0 pt-0.5">{item.label}</span>
                    <span className="font-sans text-sm text-espresso">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-peach pt-6">
                <label className="label">הערות מנהל</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="input-field resize-none mb-3"
                />
                <button
                  onClick={() => updateOrder(selected.id, { admin_notes: adminNotes })}
                  disabled={savingId === selected.id}
                  className="btn-primary text-sm"
                >
                  שמור הערות
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
