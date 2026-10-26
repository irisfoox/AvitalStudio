import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PIN = '0000';
const SESSION_KEY = 'avital_admin_auth';

export default function AdminLoginPage() {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      navigate('/admin/dashboard', { replace: true });
    }
    inputRefs[0].current?.focus();
  }, []);

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (next.every(d => d !== '') && (value || index === 3)) {
      const entered = next.join('');
      setTimeout(() => {
        if (entered === PIN) {
          sessionStorage.setItem(SESSION_KEY, 'true');
          navigate('/admin/dashboard', { replace: true });
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => { setShake(false); setDigits(['', '', '', '']); inputRefs[0].current?.focus(); }, 600);
        }
      }, 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-10 shadow-lg text-center"
      >
        <span className="font-script text-4xl text-rose">סטודיו אביטל</span>
        <h1 className="font-serif text-2xl text-espresso mt-1 mb-2">כניסת מנהל</h1>
        <p className="font-sans text-sm text-taupe mb-8">הזיני את קוד הגישה</p>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center gap-4 mb-6"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-14 h-14 text-center text-2xl font-serif rounded-2xl border-2 outline-none transition-all duration-200 ${
                error
                  ? 'border-red-400 bg-red-50 text-red-500'
                  : d
                  ? 'border-rose bg-rose/5 text-espresso'
                  : 'border-peach bg-cream text-espresso focus:border-rose'
              }`}
            />
          ))}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-sans text-sm text-red-400"
          >
            קוד שגוי, נסי שוב
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
