import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, FileText, Download, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../lib/translations';
import type { Database } from '../../lib/database.types';
import { exportToPDF, exportToWord } from '../../lib/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';

type Message = Database['public']['Tables']['messages']['Row'];
type Consultation = Database['public']['Tables']['consultations']['Row'];

interface ChatInterfaceProps {
  consultation: Consultation;
  onBack: () => void;
}

export function ChatInterface({ consultation, onBack }: ChatInterfaceProps) {
  const { profile, refreshProfile } = useAuth();
  const { language } = useApp();
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [consultation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('consultation_id', consultation.id)
        .order('created_at');

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile || loading) return;

    if (profile.credits < 1) {
      alert(t.notEnoughCredits);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          consultation_id: consultation.id,
          role: 'user',
          content: userMessage,
        });

      if (messageError) throw messageError;

      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', profile.id);

      if (creditError) throw creditError;

      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: profile.id,
          amount: -1,
          type: 'message',
          description: language === 'ar' ? 'رسالة استشارة' : 'Consultation message',
        });

      if (transactionError) throw transactionError;

      await refreshProfile();

      // Simulate AI processing
      const aiResponse = generateAIResponse();

      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          consultation_id: consultation.id,
          role: 'assistant',
          content: aiResponse,
        });

      if (aiMessageError) throw aiMessageError;

      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (): string => {
    if (language === 'ar') {
      return `شكراً لسؤالك. بناءً على ما ذكرته، أود أن أوضح النقاط القانونية التالية:\n\n1. القانون المعمول به في هذه الحالة يتطلب النظر في جميع التفاصيل المتعلقة بالموضوع.\n\n2. من المهم جداً الاحتفاظ بجميع المستندات والإثباتات ذات الصلة بالقضية.\n\n3. أنصحك بالتشاور مع محامٍ متخصص لمراجعة التفاصيل الدقيقة لحالتك.\n\nهل لديك أي معلومات إضافية أو أسئلة محددة تود مناقشتها؟`;
    } else {
      return `Thank you for your question. Based on what you've mentioned, I'd like to clarify the following legal points:\n\n1. The applicable law in this case requires consideration of all relevant details.\n\n2. It's very important to keep all documents and evidence related to the case.\n\n3. I recommend consulting with a specialized lawyer to review the specific details of your situation.\n\nDo you have any additional information or specific questions you'd like to discuss?`;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Sovereign Chat Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h2 className="font-black text-primary text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                {consultation.title}
              </h2>
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest">
                Live Analysis Mode
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => exportToPDF(messages, consultation.title, language)}
              className="p-2 hover:bg-secondary rounded-xl transition text-muted-foreground"
              title={t.exportPDF}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => exportToWord(messages, consultation.title, language)}
              className="p-2 hover:bg-secondary rounded-xl transition text-muted-foreground"
              title={t.exportWord}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6 max-w-2xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex flex-col gap-1 max-w-[85%]`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-accent text-white rounded-tr-none font-medium'
                          : 'bg-secondary/50 text-primary rounded-tl-none border border-border/50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest px-2">
                      {new Date(message.created_at).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-secondary/30 rounded-2xl px-4 py-3 border border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Sovereign Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-border">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.typeMessage}
            disabled={loading}
            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-secondary/30 border border-border/50 text-sm focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-slate-800 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rotate-180" />}
          </button>
        </form>
        <p className="text-[9px] text-center text-muted-foreground/40 mt-3 font-bold uppercase tracking-widest">
          {t.messageCost} — Sovereign AI Encrypted Session
        </p>
      </div>
    </div>
  );
}
