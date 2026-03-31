
'use client';

import { useState } from "react";
import SovereignLayout from "@/components/SovereignLayout";
import SovereignCalendar from "@/components/SovereignCalendar";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { initiateSovereignBooking } from "@/lib/sovereign-booking-engine";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, Smartphone, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * صفحة الحجز السيادي للمواطن.
 * تدمج التقويم مع تأكيد الهوية المالية والـ SMS.
 */
export default function CitizenBookingPage() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'calendar' | 'confirm' | 'success'>('calendar');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const handleSelectSlot = (date: Date, slot: string, isEmergency: boolean) => {
    setBookingDetails({ date, slot, isEmergency });
    setStep('confirm');
  };

  const confirmBooking = async () => {
    if (!user || !db) return;
    
    const price = bookingDetails.isEmergency ? 150 : 50;
    
    if (profile?.balance < price && profile?.role !== 'admin') {
      toast({ variant: "destructive", title: "رصيد غير كافٍ", description: "يرجى شحن محفظتك لمتابعة الحجز السيادي." });
      return;
    }

    initiateSovereignBooking(db, {
      userId: user.uid,
      userName: profile.fullName,
      consultantId: "supreme_consultant", // مثال
      consultantName: "خبير الجنايات السيادي",
      date: bookingDetails.date.toISOString(),
      slot: bookingDetails.slot,
      type: bookingDetails.isEmergency ? 'emergency' : 'normal',
      price: price
    });

    setStep('success');
    toast({ title: "تم توثيق الحجز بنجاح ✅" });
  };

  return (
    <SovereignLayout activeId="bookings">
      <div className="min-h-screen p-10 lg:p-20 relative">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <AnimatePresence mode="wait">
            {step === 'calendar' && (
              <motion.div key="cal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <header className="mb-16 space-y-4">
                  <div className="sovereign-badge">
                    <Calendar className="h-3 w-3" /> Booking Protocol v3.0
                  </div>
                  <h1 className="text-6xl font-black tracking-tighter text-white">جدولة <span className="text-gradient">الاستشارات</span></h1>
                  <p className="text-xl text-white/30 font-bold">حدد موعدك ضمن الكوكب القانوني. نظام SMS سيقوم بإخطارك فور التأكيد.</p>
                </header>
                <SovereignCalendar onSelectSlot={handleSelectSlot} />
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-cosmic p-12 rounded-[4rem] space-y-10">
                <h2 className="text-4xl font-black text-white text-center">تأكيد الحجز السيادي</h2>
                <div className="grid grid-cols-2 gap-6 text-right">
                  <InfoItem label="تاريخ الجلسة" value={bookingDetails.date.toLocaleDateString('ar-EG')} />
                  <InfoItem label="التوقيت" value={bookingDetails.slot} />
                  <InfoItem label="نوع الجلسة" value={bookingDetails.isEmergency ? 'طوارئ عاجلة' : 'استشارة عادية'} />
                  <InfoItem label="التكلفة" value={`${bookingDetails.isEmergency ? 150 : 50} EGP`} />
                </div>
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4 text-emerald-500">
                   <Smartphone className="h-6 w-6 animate-bounce" />
                   <p className="text-sm font-black uppercase tracking-widest leading-relaxed">سيتم إرسال رمز التحقق (SMS) إلى هاتفك المسجل فور الضغط على تأكيد.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={confirmBooking} className="flex-1 h-20 bg-primary text-black font-black text-xl rounded-3xl shadow-2xl hover:scale-105 transition-all">تأكيد ومتابعة</button>
                  <button onClick={() => setStep('calendar')} className="px-10 h-20 glass rounded-3xl text-white/40 font-bold hover:text-white">إلغاء</button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 space-y-10">
                <div className="h-40 w-40 rounded-[4rem] bg-emerald-500/20 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-3xl text-emerald-500 animate-pulse">
                  <CheckCircle2 size={80} strokeWidth={3} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-black text-white">تم الحجز سيادياً</h2>
                  <p className="text-white/30 font-bold text-xl">تأكد من هاتفك، لقد أرسلنا لك كافة تفاصيل الجلسة.</p>
                </div>
                <div className="flex justify-center gap-6">
                   <button className="bg-white/5 border border-white/10 text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">
                      <ShieldCheck size={16} /> مزامنة مع Google Calendar
                   </button>
                   <Link href="/dashboard">
                      <button className="text-white/40 hover:text-white font-bold flex items-center gap-2">العودة للوحة القيادة <ArrowRight size={16} /></button>
                   </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </SovereignLayout>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
