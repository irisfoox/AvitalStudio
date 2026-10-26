import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { href: '/admin/dashboard', label: 'לוח בקרה', icon: '◈' },
  { href: '/admin/orders', label: 'הזמנות עוגה', icon: '◻' },
  { href: '/admin/calendar', label: 'יומן הכנה', icon: '◷' },
  { href: '/admin/delivery', label: 'רשימת משלוחים', icon: '◎' },
  { href: '/admin/perfumes', label: 'בשמים', icon: '✦' },
  { href: '/admin/gallery', label: 'גלריה', icon: '◰' },
  { href: '/admin/messages', label: 'הודעות', icon: '◫' },
];

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem('avital_admin_auth') !== 'true') {
      navigate('/admin/login');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleSignOut = () => {
    sessionStorage.removeItem('avital_admin_auth');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-cream flex">
      <aside className="w-64 bg-espresso text-white fixed top-0 right-0 h-full flex flex-col">
        <div className="p-6 border-b border-white/10">
          <span className="font-script text-2xl text-rose-light">סטודיו אביטל</span>
          <p className="font-sans text-xs text-white/40 mt-0.5">ממשק ניהול</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm transition-all duration-200 ${
                location.pathname === item.href
                  ? 'bg-rose text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link to="/" className="block text-center font-sans text-xs text-white/40 hover:text-white/70 mb-3">
            ← חזור לאתר
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full font-sans text-xs text-white/40 hover:text-white/70 py-2"
          >
            התנתק
          </button>
        </div>
      </aside>
      <main className="flex-1 mr-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
