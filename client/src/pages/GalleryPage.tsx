import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import type { GalleryItem } from '../types';

const categories = [
  { value: 'all', label: 'הכל' },
  { value: 'painting', label: 'ציור שמן' },
  { value: 'watercolor', label: 'צבעי מים' },
  { value: 'mixed_media', label: 'טכניקה מעורבת' },
  { value: 'cake', label: 'עוגות' },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filtered, setFiltered] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    supabase
      .from('gallery_items')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          setItems(data);
          setFiltered(data);
        }
      });
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFiltered(items);
    } else {
      setFiltered(items.filter((i) => i.category === activeCategory));
    }
  }, [activeCategory, items]);

  const openLightbox = (item: GalleryItem) => {
    const idx = filtered.findIndex((i) => i.id === item.id);
    setLightboxIndex(idx);
    setLightbox(item);
  };

  const navigate = (dir: number) => {
    const newIdx = (lightboxIndex + dir + filtered.length) % filtered.length;
    setLightboxIndex(newIdx);
    setLightbox(filtered[newIdx]);
  };

  const categoryLabel: Record<string, string> = {
    painting: 'ציור שמן',
    watercolor: 'צבעי מים',
    mixed_media: 'טכניקה מעורבת',
    cake: 'עוגה מעוצבת',
    other: 'אחר',
  };

  return (
    <div dir="rtl" className="pt-20">
      <div className="bg-cream-dark py-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="font-sans text-xs text-rose uppercase tracking-widest font-medium">יצירות</span>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-espresso mt-2 mb-4">הגלריה שלנו</h1>
          <p className="font-sans text-taupe max-w-md mx-auto leading-relaxed">
            ציורים בעבודת יד ועוגות מעוצבות - כל יצירה היא סיפור ייחודי
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-full font-sans text-sm transition-all duration-200 ${
                activeCategory === cat.value
                  ? 'bg-rose text-white shadow-sm'
                  : 'bg-white text-taupe border border-peach hover:border-rose hover:text-rose'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="break-inside-avoid group card overflow-hidden cursor-pointer"
                onClick={() => openLightbox(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/40 transition-all duration-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <span className="font-sans text-xs text-rose font-medium">{categoryLabel[item.category]}</span>
                  <h3 className="font-serif text-lg mt-0.5 text-espresso">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-10 left-0 text-white/70 hover:text-white font-sans text-sm"
              >
                סגור ✕
              </button>
              <img
                src={lightbox.image_url}
                alt={lightbox.title}
                className="max-h-[75vh] object-contain rounded-xl mx-auto"
              />
              <div className="text-center mt-4" dir="rtl">
                <span className="font-sans text-xs text-rose-light">{categoryLabel[lightbox.category]}</span>
                <h3 className="font-serif text-xl text-white mt-1">{lightbox.title}</h3>
                {lightbox.description && (
                  <p className="font-sans text-sm text-white/60 mt-1">{lightbox.description}</p>
                )}
              </div>
              <div className="flex justify-between absolute top-1/2 -translate-y-1/2 w-full px-2">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ‹
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ›
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
