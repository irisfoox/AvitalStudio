import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import type { Perfume } from '../types';

const scentFamilyLabel: Record<string, string> = {
  floral: 'פרחוני',
  woody: 'עצי',
  oriental: 'מזרחי',
  fresh: 'טרי',
  citrus: 'הדרי',
  gourmand: 'גורמה',
  aquatic: 'ימי',
  spicy: 'תבלינים',
};

const schema = z.object({
  customer_name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  customer_email: z.string().email('כתובת אימייל לא תקינה'),
  customer_phone: z.string().optional(),
  occasion: z.string().min(1, 'בחר אירוע'),
  mood: z.string().min(1, 'בחר מצב רוח'),
  preferred_intensity: z.string().min(1, 'בחר עוצמה'),
  preferred_families: z.array(z.string()).min(1, 'בחר לפחות משפחת ריח אחת'),
  avoid_notes: z.string().optional(),
  budget_range: z.string().optional(),
  additional_info: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const occasions = ['יומיומי', 'עבודה', 'דייט', 'ערב / אירוע', 'חתונה', 'חגים', 'ים / חופשה', 'ספורט'];
const moods = ['רומנטי', 'אנרגטי', 'רגוע / מדיטטיבי', 'בטחוני / חזק', 'שמח / קליל', 'מסתורי / סקסי', 'נקי / מינימליסטי'];
const intensities = [
  { value: 'light', label: 'עדין - שנשמע רק ממרחק קצר' },
  { value: 'medium', label: 'בינוני - נוכחות מאוזנת' },
  { value: 'strong', label: 'חזק - נוכחות בולטת וממלאת חדר' },
];
const scentFamilies = Object.entries(scentFamilyLabel).map(([val, label]) => ({ val, label }));
const budgetRanges = ['עד 150 ₪', '150-300 ₪', '300-500 ₪', '500+ ₪', 'גמיש'];

function PerfumeCard({ perfume }: { perfume: Perfume }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group card overflow-hidden"
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={perfume.image_url || 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg'}
          alt={perfume.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-sans">
            {scentFamilyLabel[perfume.scent_family]}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-espresso">{perfume.name}</h3>
        <p className="font-sans text-xs text-rose font-medium mt-0.5">{perfume.brand}</p>
        <p className="font-sans text-sm text-taupe mt-2 leading-relaxed line-clamp-2">{perfume.description}</p>
        <div className="mt-4 space-y-1.5">
          {perfume.notes_top && (
            <div className="flex gap-2 items-start">
              <span className="font-sans text-xs text-taupe w-20 shrink-0">נוטות עליונות</span>
              <span className="font-sans text-xs text-espresso">{perfume.notes_top}</span>
            </div>
          )}
          {perfume.notes_middle && (
            <div className="flex gap-2 items-start">
              <span className="font-sans text-xs text-taupe w-20 shrink-0">נוטות לב</span>
              <span className="font-sans text-xs text-espresso">{perfume.notes_middle}</span>
            </div>
          )}
          {perfume.notes_base && (
            <div className="flex gap-2 items-start">
              <span className="font-sans text-xs text-taupe w-20 shrink-0">נוטות בסיס</span>
              <span className="font-sans text-xs text-espresso">{perfume.notes_base}</span>
            </div>
          )}
        </div>
        {perfume.mood.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {perfume.mood.map((m) => (
              <span key={m} className="bg-cream text-taupe text-xs px-2 py-0.5 rounded-full font-sans">{m}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PerfumePage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_intensity: 'medium', preferred_families: [] },
  });

  useEffect(() => {
    supabase.from('perfumes').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setPerfumes(data as Perfume[]);
    });
  }, []);

  const toggleFamily = (val: string) => {
    const updated = selectedFamilies.includes(val)
      ? selectedFamilies.filter((f) => f !== val)
      : [...selectedFamilies, val];
    setSelectedFamilies(updated);
    setValue('preferred_families', updated);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    const refNumber = `PERF-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const { error: err } = await supabase.from('perfume_matches').insert({
      ...data,
      reference_number: refNumber,
      status: 'pending',
    });

    setLoading(false);
    if (err) {
      setError('אירעה שגיאה. אנא נסה שנית.');
      return;
    }
    setRefNum(refNumber);
    setSubmitted(true);
  };

  return (
    <div dir="rtl" className="pt-20 bg-cream min-h-screen">
      <div
        className="relative bg-cover bg-center py-24 px-6 text-center overflow-hidden"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg)' }}
      >
        <div className="absolute inset-0 bg-espresso/65" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <span className="font-sans text-xs text-rose-light uppercase tracking-widest font-medium">ריח מותאם אישית</span>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-white mt-2 mb-4">
            בשמים תואמים
          </h1>
          <p className="font-sans text-white/70 max-w-lg mx-auto leading-relaxed mb-8">
            כל אדם הוא עולם בפני עצמו. מלאי שאלון קצר ואמצא עבורך את הניחוח שמספר את הסיפור שלך
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-10 py-4 text-base">
            מצא את הבושם שלי
          </button>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">הקולקציה שלנו</h2>
          <p className="section-subtitle max-w-md mx-auto">
            בשמים שנוצרו בהשראת אמנות, טבע ורגשות
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {perfumes.map((p) => <PerfumeCard key={p.id} perfume={p} />)}
        </div>

        <div className="bg-espresso rounded-3xl p-10 md:p-14 text-center">
          <span className="font-script text-4xl text-rose-light block mb-2">לא יודעת מה לבחור?</span>
          <h2 className="font-serif text-3xl text-white font-light mb-4">
            תני לי לעשות את זה בשבילך
          </h2>
          <p className="font-sans text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">
            ענה על כמה שאלות קצרות ואמליץ לך על הבושם שמתאים בדיוק לך - לאופי, לאירוע ולעונה
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            מלאי שאלון התאמה
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && !submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 md:p-10 max-w-2xl w-full my-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-serif text-3xl text-espresso">שאלון התאמת בושם</h2>
                  <p className="font-sans text-sm text-taupe mt-1">מלאי ואמצא את הריח המושלם עבורך</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-taupe hover:text-espresso text-2xl w-8 h-8 flex items-center justify-center">×</button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">לאיזה אירוע? *</label>
                    <select {...register('occasion')} className="input-field">
                      <option value="">בחרי...</option>
                      {occasions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {errors.occasion && <p className="text-red-400 text-xs mt-1">{errors.occasion.message}</p>}
                  </div>
                  <div>
                    <label className="label">מה מצב הרוח הרצוי? *</label>
                    <select {...register('mood')} className="input-field">
                      <option value="">בחרי...</option>
                      {moods.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {errors.mood && <p className="text-red-400 text-xs mt-1">{errors.mood.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label">עוצמת הריח *</label>
                  <div className="space-y-2">
                    {intensities.map((i) => (
                      <label key={i.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-cream transition-colors">
                        <input type="radio" value={i.value} {...register('preferred_intensity')} className="mt-0.5 accent-rose" />
                        <span className="font-sans text-sm text-espresso">{i.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">משפחות ריח מועדפות * (ניתן לבחור כמה)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {scentFamilies.map((f) => (
                      <button
                        key={f.val}
                        type="button"
                        onClick={() => toggleFamily(f.val)}
                        className={`px-4 py-2 rounded-full font-sans text-sm transition-all duration-200 ${
                          selectedFamilies.includes(f.val)
                            ? 'bg-rose text-white shadow-sm'
                            : 'bg-cream text-taupe border border-peach hover:border-rose hover:text-rose'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {errors.preferred_families && <p className="text-red-400 text-xs mt-1">{errors.preferred_families.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">ריחות שאת לא אוהבת</label>
                    <input {...register('avoid_notes')} className="input-field" placeholder="למשל: מוסק, ציפורן..." />
                  </div>
                  <div>
                    <label className="label">תקציב משוער</label>
                    <select {...register('budget_range')} className="input-field">
                      <option value="">בחרי...</option>
                      {budgetRanges.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">פרטים נוספים</label>
                  <textarea {...register('additional_info')} rows={3} className="input-field resize-none" placeholder="ספרי לי עוד על עצמך, הריחות שאהבת בעבר, אנשים שהשפיעו עליך..." />
                </div>

                {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">{error}</p>}

                <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-base disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      שולח...
                    </span>
                  ) : 'שלחי את השאלון'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showForm && submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-espresso mb-2">השאלון התקבל!</h2>
              <p className="font-sans text-taupe text-sm mb-6 leading-relaxed">
                תודה! אביטל תעיין בתשובותיך ותחזור אליך עם המלצה אישית תוך 72 שעות.
              </p>
              <div className="bg-cream rounded-2xl p-4 mb-6">
                <span className="font-sans text-xs text-taupe block">מספר פנייה</span>
                <span className="font-sans font-medium text-espresso">{refNum}</span>
              </div>
              <button onClick={() => { setShowForm(false); setSubmitted(false); }} className="btn-outline text-sm">
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
