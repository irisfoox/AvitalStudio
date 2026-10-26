import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'בית', href: '/' },
  { label: 'גלריה', href: '/gallery' },
  { label: 'הזמנת עוגה', href: '/order' },
  { label: 'בשמים', href: '/perfume' },
  { label: 'אודות', href: '/about' },
  { label: 'צור קשר', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      dir="rtl"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-script text-3xl text-rose">סטודיו אביטל</span>
          <span className="font-sans text-xs text-taupe tracking-widest uppercase">Art & Cakes</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-full font-sans text-sm transition-all duration-200 ${
                location.pathname === link.href
                  ? 'text-rose font-medium bg-rose/10'
                  : 'text-taupe hover:text-espresso hover:bg-cream-dark'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/order" className="btn-primary mr-4 text-xs">
            הזמן עכשיו
          </Link>
        </nav>

        <button
          className="md:hidden p-2 text-espresso"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="תפריט"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-espresso transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-espresso transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-espresso transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white/98 backdrop-blur-sm border-t border-peach px-6 py-4"
            dir="rtl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block py-3 border-b border-peach/50 font-sans text-sm last:border-0 ${
                  location.pathname === link.href ? 'text-rose font-medium' : 'text-rose'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/order" className="btn-primary block text-center mt-4 text-xs">
              הזמן עכשיו
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
