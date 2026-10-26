import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const schema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  subject: z.string().optional(),
  message: z.string().min(10, 'ההודעה חייבת להכיל לפחות 10 תווים'),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('contact_messages').insert(data);

    setLoading(false);
    if (err) {
      setError('אירעה שגיאה. אנא נסה שנית.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div dir="rtl" className="pt-20 bg-cream min-h-screen">
      <div className="bg-cream-dark py-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="font-sans text-xs text-rose uppercase tracking-widest font-medium">דברו איתי</span>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-espresso mt-2 mb-4">צור קשר</h1>
          <p className="font-sans text-taupe max-w-md mx-auto">
            יש לך שאלה? רעיון מיוחד? השאר פרטים ואחזור אליך תוך 72 שעות
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-serif text-3xl text-espresso mb-8">פרטי התקשרות</h2>
          {[
            { icon: '📧', label: 'אימייל', value: 'avital7979@gmail.com' },
            { icon: '📞', label: 'טלפון', value: '050-000-0000' },
            { icon: '📍', label: 'מיקום', value: 'תל אביב, ישראל' },
            { icon: '⏰', label: 'שעות פעילות', value: 'א׳-ה׳ 9:00-19:00' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 mb-6">
              <span className="text-2xl w-10 shrink-0">{item.icon}</span>
              <div>
                <span className="font-sans text-xs text-rose uppercase tracking-wider font-medium block">{item.label}</span>
                <span className="font-sans text-espresso">{item.value}</span>
              </div>
            </div>
          ))}

          <div className="bg-rose/10 rounded-2xl p-6 mt-8">
            <h3 className="font-serif text-xl text-espresso mb-2">זמני הזמנה</h3>
            <p className="font-sans text-sm text-taupe leading-relaxed">
              עוגות - יש להזמין לפחות <strong>2-4 שבועות</strong> מראש.<br/>
              ציורים - לפחות <strong>1-2 שבועות</strong> מראש.<br/>
              עונת חגים - יש לתאם מוקדם יותר.
            </p>
          </div>
        </div>

        <div>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-10 text-center shadow-sm h-full flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-espresso mb-2">ההודעה נשלחה!</h2>
              <p className="font-sans text-taupe text-sm">אחזור אליך בהקדם האפשרי.</p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">שם מלא *</label>
                  <input {...register('name')} className="input-field" placeholder="ישראל ישראלי" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">אימייל *</label>
                  <input {...register('email')} type="email" className="input-field" placeholder="email@example.com" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">נושא</label>
                  <input {...register('subject')} className="input-field" placeholder="שאלה כללית, הצעת מחיר..." />
                </div>
                <div>
                  <label className="label">הודעה *</label>
                  <textarea {...register('message')} rows={5} className="input-field resize-none" placeholder="ספר לי על מה שאתה מחפש..." />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-primary py-4 disabled:opacity-60">
                  {loading ? 'שולח...' : 'שלח הודעה'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
