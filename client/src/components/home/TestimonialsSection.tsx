import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import type { Testimonial } from '../../types';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data) setTestimonials(data);
      });
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  const t = testimonials[current];

  return (
    <section dir="rtl" className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <span className="font-sans text-xs text-rose uppercase tracking-widest font-medium">מה אומרים עלינו</span>
        <h2 className="section-title mt-2 mb-12">ביקורות לקוחות</h2>

        <div className="relative h-44 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <svg className="w-8 h-8 text-rose/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <p className="font-serif text-xl md:text-2xl font-light text-espresso leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <div>
                <span className="font-sans text-sm font-medium text-espresso">{t.customer_name}</span>
                {t.event_type && (
                  <span className="font-sans text-xs text-taupe mr-2"> · {t.event_type}</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-rose w-6' : 'bg-peach'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
