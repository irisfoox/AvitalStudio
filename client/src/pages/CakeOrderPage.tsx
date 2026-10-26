import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const schema = z.object({
  customer_name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  customer_email: z.string().email('כתובת אימייל לא תקינה'),
  customer_phone: z.string().optional(),
  event_type: z.string().min(1, 'בחר סוג אירוע'),
  event_date: z.string().min(1, 'בחר תאריך'),
  theme: z.string().min(2, 'תאר את הנושא'),
  cake_size: z.string().min(1, 'בחר גודל עוגה'),
  tiers: z.number().min(1).max(6),
  flavour: z.string().optional(),
  dietary_notes: z.string().optional(),
  special_requests: z.string().optional(),
  budget_range: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const eventTypes = ['יום הולדת', 'חתונה', 'בר מצווה', 'בת מצווה', 'ברית', 'ימי נישואין', 'יום עצמאות', 'סיום לימודים', 'אחר'];
const cakeSizes = ['6 אינץ׳ (8-10 מנות)', '8 אינץ׳ (12-16 מנות)', '10 אינץ׳ (20-25 מנות)', '12 אינץ׳ (30+ מנות)', 'שיט (20-30 מנות)', 'שיט גדול (40+ מנות)'];
const budgetRanges = ['עד 300 ₪', '300-500 ₪', '500-800 ₪', '800-1200 ₪', '1200+ ₪'];

export default function CakeOrderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tiers: 1 },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    const refNumber = `CAKE-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const { error: err } = await supabase.from('cake_orders').insert({
      ...data,
      reference_number: refNumber,
      status: 'pending',
    });

    setLoading(false);

    if (err) {
      setError('אירעה שגיאה בשליחת הטופס. אנא נסה שנית.');
      return;
    }

    setRefNum(refNumber);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div dir="rtl" className="pt-20 min-h-screen bg-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-lg"
        >
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl text-espresso mb-2">ההזמנה התקבלה!</h2>
          <p className="font-sans text-taupe text-sm mb-6 leading-relaxed">
            תודה על ההזמנה! ניצור איתך קשר תוך 72 שעות לאישור הפרטים.
          </p>
          <div className="bg-cream rounded-2xl p-4 mb-6">
            <span className="font-sans text-xs text-taupe block">מספר הזמנה</span>
            <span className="font-sans font-medium text-espresso text-lg">{refNum}</span>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-outline text-sm"
          >
            הזמנה נוספת
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="pt-20 bg-cream min-h-screen">
      <div className="bg-cream-dark py-16 px-6 text-center">
        <span className="font-sans text-xs text-rose uppercase tracking-widest font-medium">הזמנה</span>
        <h1 className="font-serif text-4xl md:text-6xl font-light text-espresso mt-2 mb-4">
          הזמן עוגה מעוצבת
        </h1>
        <p className="font-sans text-taupe max-w-md mx-auto leading-relaxed">
          מלא את הפרטים ונחזור אליך תוך 72 שעות עם הצעת מחיר ואישור
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl text-espresso mb-6 pb-3 border-b border-peach">
                פרטי התקשרות
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">שם מלא *</label>
                  <input {...register('customer_name')} className="input-field" placeholder="ישראל ישראלי" />
                  {errors.customer_name && <p className="text-red-400 text-xs mt-1">{errors.customer_name.message}</p>}
                </div>
                <div>
                  <label className="label">אימייל *</label>
                  <input {...register('customer_email')} type="email" className="input-field" placeholder="email@example.com" />
                  {errors.customer_email && <p className="text-red-400 text-xs mt-1">{errors.customer_email.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="label">טלפון</label>
                  <input {...register('customer_phone')} type="tel" className="input-field" placeholder="050-000-0000" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-espresso mb-6 pb-3 border-b border-peach">
                פרטי האירוע
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">סוג האירוע *</label>
                  <select {...register('event_type')} className="input-field">
                    <option value="">בחר...</option>
                    {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.event_type && <p className="text-red-400 text-xs mt-1">{errors.event_type.message}</p>}
                </div>
                <div>
                  <label className="label">תאריך האירוע *</label>
                  <input {...register('event_date')} type="date" className="input-field" />
                  {errors.event_date && <p className="text-red-400 text-xs mt-1">{errors.event_date.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-espresso mb-6 pb-3 border-b border-peach">
                עיצוב העוגה
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">נושא / עיצוב *</label>
                  <input {...register('theme')} className="input-field" placeholder="למשל: גינה אנגלית, ים ודגים, דיסני, אבסטרקט..." />
                  {errors.theme && <p className="text-red-400 text-xs mt-1">{errors.theme.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">גודל עוגה *</label>
                    <select {...register('cake_size')} className="input-field">
                      <option value="">בחר...</option>
                      {cakeSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.cake_size && <p className="text-red-400 text-xs mt-1">{errors.cake_size.message}</p>}
                  </div>
                  <div>
                    <label className="label">מספר קומות</label>
                    <input {...register('tiers', { valueAsNumber: true })} type="number" min={1} max={6} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">טעם עוגה</label>
                  <input {...register('flavour')} className="input-field" placeholder="שוקולד, וניל, לימון, תות..." />
                </div>
                <div>
                  <label className="label">הגבלות תזונה</label>
                  <input {...register('dietary_notes')} className="input-field" placeholder="ללא גלוטן, ללא לקטוז, טבעוני..." />
                </div>
                <div>
                  <label className="label">תקציב משוער</label>
                  <select {...register('budget_range')} className="input-field">
                    <option value="">בחר...</option>
                    {budgetRanges.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">בקשות מיוחדות</label>
                  <textarea {...register('special_requests')} rows={4} className="input-field resize-none" placeholder="רעיונות, השראות, צבעים מועדפים, הכתבה על העוגה..." />
                </div>
              </div>
            </div>

            {error && (
              <p className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  שולח...
                </span>
              ) : 'שלח הזמנה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
