
'use client';

import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { motion } from "framer-motion";
import { Clock, User, Phone, Zap, CalendarDays, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { executeAutoRefund } from "@/lib/sovereign-booking-engine";
import { useToast } from "@/hooks/use-toast";

/**
 * واجهة الخبير السيادية (Provider Schedule View).
 * مخصصة للمحامين لإدارة المواعيد المجدولة.
 */
export default function ProviderSchedulePage() {
  const { user, role } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);

  const handleCancelWithRefund = (b: any) => {
    if (!confirm("هل أنت متأكد؟ سيتم استرداد المبلغ للمواطن آلياً.")) return;
    executeAutoRefund(db!, b.userId, b.price, b.id);
    toast({ title: "تم الإلغاء والاسترداد الآلي 💰" });
  };

  return (
    <SovereignLayout activeId="dash">
      <div className="min-h-screen p-10 lg:p-20 relative">
        <header className="mb-16 flex justify-between items-end">
          <div className="space-y-4">
            <div className="sovereign-badge">
              <Zap className="h-3 w-3" /> Expert Operational Node
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white">جدول <span className="text-gradient">العمليات</span></h1>
            <p className="text-xl text-white/30 font-bold">إدارة الجلسات الاستشارية النشطة والمجدولة.</p>
          </div>
        </header>

        <main className="max-w-5xl space-y-6">
          {isLoading ? (
            <div className="py-20 flex justify-center opacity-20"><Loader2 className="animate-spin h-12 w-12" /></div>
          ) : (
            <div className="space-y-4">
              {bookings?.map((b, i) => (
                <motion.div 
                  key={b.id} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-cosmic p-8 rounded-[2.5rem] border-white/5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-8">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border ${b.type === 'emergency' ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                      {b.type === 'emergency' ? <AlertCircle /> : <Clock />}
                    </div>
                    <div className="text-right">
                      <h4 className="text-xl font-black text-white">{b.userName}</h4>
                      <p className="text-xs text-white/20 font-bold mt-1 uppercase tracking-widest">{b.date.split('T')[0]} • {b.slot}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="h-12 w-12 glass rounded-xl flex items-center justify-center text-white/20 hover:text-white transition-all"><Phone size={18} /></button>
                    <button 
                      onClick={() => handleCancelWithRefund(b)}
                      className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      إلغاء واسترداد <RefreshCw size={12} className="inline ml-2" />
                    </button>
                    <button className="bg-primary text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">بدء الجلسة</button>
                  </div>
                </motion.div>
              ))}
              
              {bookings?.length === 0 && (
                <div className="py-40 text-center glass rounded-[4rem] border-dashed border-white/5">
                   <CalendarDays className="h-20 w-20 mx-auto text-white/5 mb-6" />
                   <p className="text-2xl font-black text-white/20">لا توجد حجوزات نشطة حالياً</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </SovereignLayout>
  );
}
