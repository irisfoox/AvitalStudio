import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CakeOrder } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending:     { label: 'ממתינה', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  confirmed:   { label: 'אושרה', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  in_progress: { label: 'בביצוע', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  ready:       { label: 'מוכנה', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  delivered:   { label: 'נמסרה', color: 'bg-success/20 text-success', dot: 'bg-success' },
  cancelled:   { label: 'בוטלה', color: 'bg-red-100 text-red-400', dot: 'bg-red-400' },
};

const HEBREW_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AdminCalendarPage() {
  const [orders, setOrders] = useState<CakeOrder[]>([]);
  const [today] = useState(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CakeOrder | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('cake_orders')
      .select('*')
      .not('status', 'eq', 'cancelled')
      .order('event_date')
      .then(({ data }) => {
        if (data) setOrders(data as CakeOrder[]);
      });
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const ordersForDay = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return orders.filter(o => o.event_date === dateStr);
  };

  const selectedDayOrders = selectedDay ? ordersForDay(selectedDay) : [];

  const updateStatus = async (id: string, status: CakeOrder['status']) => {
    setSavingId(id);
    const { data } = await supabase
      .from('cake_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (data) {
      setOrders(prev => prev.map(o => o.id === id ? data as CakeOrder : o));
      if (selectedOrder?.id === id) setSelectedOrder(data as CakeOrder);
    }
    setSavingId(null);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const upcomingOrders = orders
    .filter(o => new Date(o.event_date) >= new Date(today.toDateString()))
    .slice(0, 8);

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-espresso">יומן הכנה</h1>
        <p className="font-sans text-taupe text-sm mt-1">תאריכי אירועים והכנת עוגות</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-peach">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-taupe hover:text-espresso">
                ‹
              </button>
              <h2 className="font-serif text-xl text-espresso">
                {HEBREW_MONTHS[viewMonth]} {viewYear}
              </h2>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-taupe hover:text-espresso">
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-peach">
              {HEBREW_DAYS.map(d => (
                <div key={d} className="text-center py-3 font-sans text-xs text-taupe font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarCells.map((day, idx) => {
                const dayOrders = day ? ordersForDay(day) : [];
                const isSelected = day === selectedDay;
                return (
                  <div
                    key={idx}
                    onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                    className={`min-h-[72px] p-1.5 border-b border-l border-peach/60 cursor-pointer transition-colors ${
                      !day ? 'bg-cream/30' :
                      isSelected ? 'bg-rose/10' :
                      isToday(day) ? 'bg-cream' :
                      'hover:bg-cream/50'
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`font-sans text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                          isToday(day) ? 'bg-rose text-white font-medium' : 'text-espresso'
                        }`}>{day}</span>
                        <div className="space-y-0.5">
                          {dayOrders.slice(0, 2).map(o => (
                            <div key={o.id} className={`text-xs px-1.5 py-0.5 rounded font-sans truncate ${statusConfig[o.status]?.color}`}>
                              {o.customer_name}
                            </div>
                          ))}
                          {dayOrders.length > 2 && (
                            <span className="font-sans text-xs text-taupe">+{dayOrders.length - 2}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {selectedDay && selectedDayOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="card mt-4 p-5"
              >
                <h3 className="font-serif text-lg text-espresso mb-4">
                  הזמנות ל-{selectedDay} {HEBREW_MONTHS[viewMonth]}
                </h3>
                <div className="space-y-3">
                  {selectedDayOrders.map(order => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-right flex items-center justify-between gap-4 p-3 rounded-xl bg-cream hover:bg-cream-dark transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-sans text-sm font-medium text-espresso">{order.customer_name}</p>
                        <p className="font-sans text-xs text-taupe">{order.event_type} · {order.theme}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-sans shrink-0 ${statusConfig[order.status]?.color}`}>
                        {statusConfig[order.status]?.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {selectedDay && selectedDayOrders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card mt-4 p-5 text-center"
              >
                <p className="font-sans text-sm text-taupe">אין הזמנות ב-{selectedDay} {HEBREW_MONTHS[viewMonth]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-serif text-lg text-espresso mb-4">הזמנות קרובות</h3>
            {upcomingOrders.length === 0 ? (
              <p className="font-sans text-sm text-taupe text-center py-4">אין הזמנות קרובות</p>
            ) : (
              <div className="space-y-3">
                {upcomingOrders.map(order => {
                  const d = new Date(order.event_date);
                  const diffDays = Math.ceil((d.getTime() - new Date(today.toDateString()).getTime()) / 86400000);
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-right p-3 rounded-xl bg-cream hover:bg-cream-dark transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-medium text-espresso truncate">{order.customer_name}</p>
                          <p className="font-sans text-xs text-taupe">{order.event_type}</p>
                        </div>
                        <div className="text-left shrink-0">
                          <span className={`font-sans text-xs font-medium ${diffDays <= 3 ? 'text-red-500' : diffDays <= 7 ? 'text-amber-600' : 'text-taupe'}`}>
                            {diffDays === 0 ? 'היום' : diffDays === 1 ? 'מחר' : `בעוד ${diffDays} ימים`}
                          </span>
                          <p className="font-sans text-xs text-taupe/60">{d.toLocaleDateString('he-IL')}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-serif text-base text-espresso mb-3">מקרא</h3>
            <div className="space-y-2">
              {Object.entries(statusConfig).filter(([k]) => k !== 'cancelled').map(([, cfg]) => (
                <div key={cfg.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="font-sans text-xs text-taupe">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full max-w-lg bg-white h-full overflow-y-auto p-8 shadow-2xl"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-serif text-2xl text-espresso">{selectedOrder.customer_name}</h2>
                  <p className="font-sans text-xs text-taupe">{selectedOrder.reference_number}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-taupe hover:text-espresso text-2xl w-8 h-8 flex items-center justify-center">×</button>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'אירוע', value: selectedOrder.event_type },
                  { label: 'תאריך', value: new Date(selectedOrder.event_date).toLocaleDateString('he-IL') },
                  { label: 'נושא', value: selectedOrder.theme },
                  { label: 'גודל', value: selectedOrder.cake_size },
                  { label: 'קומות', value: String(selectedOrder.tiers) },
                  { label: 'טעם', value: selectedOrder.flavour || '-' },
                  { label: 'הגבלות', value: selectedOrder.dietary_notes || '-' },
                  { label: 'בקשות', value: selectedOrder.special_requests || '-' },
                  { label: 'תקציב', value: selectedOrder.budget_range || '-' },
                  { label: 'אימייל', value: selectedOrder.customer_email },
                  { label: 'טלפון', value: selectedOrder.customer_phone || '-' },
                ].map(item => (
                  <div key={item.label} className="flex gap-3">
                    <span className="font-sans text-xs text-taupe w-20 shrink-0 pt-0.5">{item.label}</span>
                    <span className="font-sans text-sm text-espresso">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-peach pt-4">
                <label className="label mb-2 block">עדכון סטטוס</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([val, cfg]) => (
                    <button
                      key={val}
                      disabled={savingId === selectedOrder.id}
                      onClick={() => updateStatus(selectedOrder.id, val as CakeOrder['status'])}
                      className={`text-xs px-3 py-1.5 rounded-full font-sans font-medium transition-all ${
                        selectedOrder.status === val
                          ? cfg.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-cream text-taupe hover:bg-cream-dark'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
