import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { ContactMessage } from '../../types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMessages(data as ContactMessage[]);
      });
  }, []);

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    setSelected((prev) => prev && prev.id === id ? { ...prev, is_read: true } : prev);
  };

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-espresso">הודעות יצירת קשר</h1>
        <p className="font-sans text-taupe text-sm mt-1">{messages.filter((m) => !m.is_read).length} הודעות לא נקראו</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="divide-y divide-peach">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg); if (!msg.is_read) markRead(msg.id); }}
                className={`w-full text-right p-4 hover:bg-cream transition-colors flex gap-3 ${selected?.id === msg.id ? 'bg-cream' : ''}`}
              >
                {!msg.is_read && <div className="w-2 h-2 bg-rose rounded-full mt-1.5 shrink-0" />}
                <div className={!msg.is_read ? '' : 'mr-5'}>
                  <p className={`font-sans text-sm ${msg.is_read ? 'text-taupe' : 'text-espresso font-medium'}`}>{msg.name}</p>
                  <p className="font-sans text-xs text-taupe line-clamp-1">{msg.subject || msg.message}</p>
                  <p className="font-sans text-xs text-taupe/60 mt-1">{new Date(msg.created_at).toLocaleDateString('he-IL')}</p>
                </div>
              </button>
            ))}
            {messages.length === 0 && (
              <p className="font-sans text-taupe text-center py-12">אין הודעות עדיין</p>
            )}
          </div>
        </div>

        {selected ? (
          <div className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-serif text-xl text-espresso">{selected.name}</h2>
                <a href={`mailto:${selected.email}`} className="font-sans text-xs text-rose hover:underline">{selected.email}</a>
              </div>
              <span className="font-sans text-xs text-taupe">{new Date(selected.created_at).toLocaleDateString('he-IL')}</span>
            </div>
            {selected.subject && (
              <p className="font-sans text-sm font-medium text-espresso mb-3">{selected.subject}</p>
            )}
            <p className="font-sans text-sm text-taupe leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            <div className="mt-6">
              <a href={`mailto:${selected.email}`} className="btn-primary text-sm">
                השב באימייל
              </a>
            </div>
          </div>
        ) : (
          <div className="card p-6 flex items-center justify-center text-taupe">
            <p className="font-sans text-sm">בחר הודעה לקריאה</p>
          </div>
        )}
      </div>
    </div>
  );
}
