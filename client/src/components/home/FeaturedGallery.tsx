import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import type { GalleryItem } from '../../types';

const categoryLabel: Record<string, string> = {
  painting: 'ציור שמן',
  watercolor: 'צבעי מים',
  mixed_media: 'טכניקה מעורבת',
  cake: 'עוגה מעוצבת',
  other: 'אחר',
};

export default function FeaturedGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    supabase
      .from('gallery_items')
      .select('*')
      .eq('is_featured', true)
      .order('sort_order')
      .limit(6)
      .then(({ data }) => {
        if (data) setItems(data);
      });
  }, []);

  return (
    <section className="py-20 px-6 bg-cream" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title mb-3">יצירות נבחרות</h2>
          <p className="section-subtitle max-w-md mx-auto">
            מבחר מהעבודות האחרונות שלנו - ציורים ועוגות שנוצרו מאהבה
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group card overflow-hidden cursor-pointer"
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/30 transition-all duration-300" />
              </div>
              <div className="p-4">
                <span className="font-sans text-xs text-rose font-medium uppercase tracking-wider">
                  {categoryLabel[item.category]}
                </span>
                <h3 className="font-serif text-lg mt-1 text-espresso">{item.title}</h3>
                {item.description && (
                  <p className="font-sans text-xs text-taupe mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/gallery" className="btn-outline">
            לכל הגלריה
          </Link>
        </div>
      </div>
    </section>
  );
}
