import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div dir="rtl" className="pt-20 bg-cream">
      <div className="bg-cream-dark py-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="font-sans text-xs text-rose uppercase tracking-widest font-medium">הסיפור שלי</span>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-espresso mt-2">אודות</h1>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-script text-4xl text-rose">שלום, אני אביטל</span>
            <h2 className="font-serif text-3xl font-light text-espresso mt-2 mb-6">
              אמנית, יוצרת עוגות ומומחית בשמים
            </h2>
            <p className="font-sans text-taupe leading-relaxed mb-4">
              מאז גיל צעיר, אמנות הייתה חלק בלתי נפרד מחיי. ציירתי על כל משטח שמצאתי - קנבס, נייר, ואפילו על העוגות שאמא שלי אפתה.
            </p>
            <p className="font-sans text-taupe leading-relaxed mb-4">
              לפני 8 שנים, החלטתי לאחד את אהבותיי - אמנות, אפייה וניחוחות - לתוך עסק אחד. היום אני יוצרת ציורים בעבודת יד, עוגות מעוצבות ומכינה שאלוני התאמה אישית לבשמים.
            </p>
            <p className="font-sans text-taupe leading-relaxed">
              כל יצירה מקבלת ממני תשומת לב מלאה ואהבה אמיתית. בין אם זה ציור, עוגה או בושם - אתם מקבלים משהו שנוצר במיוחד עבורכם.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-lg">
              <img
                src="https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg"
                alt="אביטל בסטודיו"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-rose rounded-2xl p-6 shadow-lg text-white">
              <span className="font-serif text-4xl font-light">8+</span>
              <p className="font-sans text-xs mt-1 opacity-80">שנות ניסיון</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { num: '500+', label: 'עוגות שנוצרו', desc: 'לאירועים בכל רחבי הארץ' },
            { num: '200+', label: 'ציורים', desc: 'בסגנונות ושיטות שונות' },
            { num: '98%', label: 'לקוחות מרוצים', desc: 'שחוזרים שוב ומפנים חברים' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-8 text-center"
            >
              <span className="font-serif text-5xl font-light text-rose">{stat.num}</span>
              <h3 className="font-serif text-xl mt-2 mb-1 text-espresso">{stat.label}</h3>
              <p className="font-sans text-sm text-taupe">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-cream-dark rounded-3xl p-10 md:p-14">
          <h2 className="font-serif text-3xl text-espresso mb-8 text-center">שיטת העבודה שלי</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'שיחה ראשונית', desc: 'מדברים על החזון שלך, האירוע, הטעמים והתקציב' },
              { step: '02', title: 'עיצוב ואישור', desc: 'אני מציגה סקיצה לאישורך לפני שמתחילים' },
              { step: '03', title: 'יצירה', desc: 'עבודה מסורה עם חומרים איכותיים בלבד' },
              { step: '04', title: 'מסירה', desc: 'מסירה אישית לאירוע או איסוף עצמי' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="font-serif text-5xl text-rose/30 font-light">{s.step}</span>
                <h3 className="font-serif text-xl mt-2 mb-2 text-espresso">{s.title}</h3>
                <p className="font-sans text-sm text-taupe leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link to="/order" className="btn-primary text-base px-10 py-4">
            הזמן עוגה מעוצבת
          </Link>
        </div>
      </div>
    </div>
  );
}
