import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center animate-ken-burns"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/60 via-espresso/40 to-espresso/70" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="font-script text-5xl md:text-7xl text-white/90 block mb-2">
            סטודיו אביטל
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-white leading-tight mb-4">
            ציורים בעבודת יד
            <span className="block text-rose-light"> ועוגות לאירועים</span>
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 font-light leading-relaxed mb-10 max-w-xl mx-auto">
            כל יצירה ועוגה מעוצבת בהתאמה אישית לאירוע שלך.
            יצירתיות, אהבה ותשומת לב לכל פרט.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/gallery" className="btn-primary text-sm md:text-base px-8 py-4">
              צפה בגלריה
            </Link>
            <Link to="/order" className="btn-outline text-sm md:text-base px-8 py-4 border-white text-white hover:bg-white hover:text-espresso">
              הזמן עוגה
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
