import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CallToActionBanner() {
  return (
    <section dir="rtl" className="py-20 px-6 bg-cream-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto bg-espresso rounded-3xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <span className="font-script text-4xl text-rose-light block mb-3">רעיון מיוחד?</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white mb-4">
              הפוך את החלום שלך לממשות
            </h2>
            <p className="font-sans text-sm text-white/60 leading-relaxed mb-8">
              יום הולדת, חתונה, בר מצווה, בת מצווה, ימי נישואין - כל אירוע מיוחד ראוי לעוגה מיוחדת.
              ספר לנו על החזון שלך ואנחנו ניצור אותו.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/order" className="btn-primary text-sm text-center">
                הזמן עוגה מעוצבת
              </Link>
              <Link to="/contact" className="font-sans text-sm text-white/60 hover:text-white transition-colors py-3 text-center">
                שאל שאלה →
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative overflow-hidden h-72 md:h-auto">
            <img
              src="https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg"
              alt="עוגה מעוצבת"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
