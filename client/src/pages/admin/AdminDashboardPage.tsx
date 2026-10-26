import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  galleryItems: number;
  unreadMessages: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, pendingOrders: 0, galleryItems: 0, unreadMessages: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [orders, gallery, messages] = await Promise.all([
        supabase.from('cake_orders').select('status'),
        supabase.from('gallery_items').select('id'),
        supabase.from('contact_messages').select('is_read').eq('is_read', false),
      ]);

      setStats({
        totalOrders: orders.data?.length ?? 0,
        pendingOrders: orders.data?.filter((o) => o.status === 'pending').length ?? 0,
        galleryItems: gallery.data?.length ?? 0,
        unreadMessages: messages.data?.length ?? 0,
      });
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'סה"כ הזמנות', value: stats.totalOrders, href: '/admin/orders', color: 'bg-rose' },
    { label: 'ממתינות לאישור', value: stats.pendingOrders, href: '/admin/orders', color: 'bg-amber-400' },
    { label: 'פריטי גלריה', value: stats.galleryItems, href: '/admin/gallery', color: 'bg-sage' },
    { label: 'הודעות חדשות', value: stats.unreadMessages, href: '/admin/messages', color: 'bg-taupe' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-espresso">לוח בקרה</h1>
        <p className="font-sans text-taupe text-sm mt-1">ברוך הבא חזרה</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={card.href} className="block card p-6 hover:shadow-md">
              <div className={`w-10 h-10 ${card.color} rounded-xl mb-4 opacity-80`} />
              <span className="font-serif text-4xl text-espresso font-light">{card.value}</span>
              <p className="font-sans text-sm text-taupe mt-1">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-serif text-xl text-espresso mb-4">קישורים מהירים</h2>
          <div className="space-y-2">
            <Link to="/admin/orders" className="flex items-center justify-between p-3 bg-cream rounded-xl hover:bg-cream-dark transition-colors">
              <span className="font-sans text-sm text-espresso">צפה בכל ההזמנות</span>
              <span className="text-taupe">→</span>
            </Link>
            <Link to="/admin/gallery" className="flex items-center justify-between p-3 bg-cream rounded-xl hover:bg-cream-dark transition-colors">
              <span className="font-sans text-sm text-espresso">ניהול גלריה</span>
              <span className="text-taupe">→</span>
            </Link>
            <Link to="/admin/messages" className="flex items-center justify-between p-3 bg-cream rounded-xl hover:bg-cream-dark transition-colors">
              <span className="font-sans text-sm text-espresso">הודעות יצירת קשר</span>
              <span className="text-taupe">→</span>
            </Link>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-serif text-xl text-espresso mb-4">תצוגה מקדימה של האתר</h2>
          <p className="font-sans text-sm text-taupe mb-4">צפה באתר כפי שלקוחות רואים אותו</p>
          <Link to="/" target="_blank" className="btn-outline text-sm">
            פתח את האתר
          </Link>
        </div>
      </div>
    </div>
  );
}
