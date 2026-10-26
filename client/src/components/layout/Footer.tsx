import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer dir="rtl" className="bg-espresso text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <span className="font-script text-3xl text-rose-light">סטודיו אביטל</span>
            <p className="font-sans text-sm text-white/60 mt-2 leading-relaxed">
              אמנות בעבודת יד, עוגות מעוצבות ובשמים תואמים אישית. כל יצירה מתוכננת עם אהבה ותשומת לב לפרטים הקטנים.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-sm font-medium text-white tracking-wider uppercase mb-4">ניווט</h4>
            <ul className="space-y-2">
              {[
                { label: 'בית', href: '/' },
                { label: 'גלריה', href: '/gallery' },
                { label: 'הזמנת עוגה', href: '/order' },
                { label: 'בשמים תואמים', href: '/perfume' },
                { label: 'אודות', href: '/about' },
                { label: 'צור קשר', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="font-sans text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-medium text-white tracking-wider uppercase mb-4">צור קשר</h4>
            <p className="font-sans text-sm text-white/60">avital7979@gmail.com</p>
            <p className="font-sans text-sm text-white/60 mt-1">050-000-0000</p>
            <p className="font-sans text-sm text-white/60 mt-3 leading-relaxed">
              זמן תגובה: עד 72 שעות<br/>
              הזמנות: 2-4 שבועות מראש
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="font-sans text-xs text-white/40">
            © {new Date().getFullYear()} סטודיו אביטל. כל הזכויות שמורות.
          </p>
          <p className="font-sans text-xs text-white/50 text-center">
            כל המוצרים כשרים בהכשר בד"ץ ירושלים – העדה החרדית
          </p>
          <Link to="/admin" className="font-sans text-xs text-white/30 hover:text-white/50 transition-colors">
            כניסת מנהל
          </Link>
        </div>
      </div>
    </footer>
  );
}
