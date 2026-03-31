
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SovereignCalendarProps {
  onSelectSlot: (date: Date, slot: string, isEmergency: boolean) => void;
}

/**
 * واجهة التقويم الملكية (Apple Style Calendar).
 * تصميم أسود ملكي، تفاعلي بالكامل مع دعم الطوارئ.
 */
export default function SovereignCalendar({ onSelectSlot }: SovereignCalendarProps) {
  const today = startOfToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isEmergency, setIsEmergency] = useState(false);

  const slots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "08:00 PM"];

  // توليد الأيام القادمة بأسلوب Apple
  const days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  return (
    <div className="w-full space-y-10 text-right" dir="rtl">
      {/* Emergency Toggle - إضافة 2: حجز الطوارئ */}
      <div 
        onClick={() => setIsEmergency(!isEmergency)}
        className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${
          isEmergency ? 'border-red-500 bg-red-500/10 shadow-3xl shadow-red-500/20' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
        }`}
      >
        <div className="flex items-center gap-5">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${isEmergency ? 'bg-red-500 text-white' : 'bg-white/5 text-white/20'}`}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <h4 className={`text-xl font-black ${isEmergency ? 'text-red-500' : 'text-white'}`}>بروتوكول الطوارئ السيادي</h4>
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Immediate Legal Intervention</p>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${isEmergency ? 'border-red-500 bg-red-500' : 'border-white/10'}`}>
          {isEmergency && <CheckCircle2 className="text-white" size={20} />}
        </div>
      </div>

      <div className="glass-cosmic border-white/10 rounded-[3.5rem] p-10 space-y-12">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CalendarIcon className="text-primary h-6 w-6" />
            <h3 className="text-2xl font-black text-white">اختر موعد الجلسة</h3>
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/40"><ChevronRight /></button>
            <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/40"><ChevronLeft /></button>
          </div>
        </header>

        {/* Days Strip */}
        <div className="flex justify-between gap-4 overflow-x-auto pb-4 scrollbar-none">
          {days.map((day, i) => {
            const active = isSameDay(day, selectedDate);
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-24 py-8 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-500 border ${
                  active ? 'bg-primary border-primary shadow-3xl scale-110 z-10' : 'bg-white/[0.02] border-white/5 text-white/20 hover:border-white/20'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-black' : ''}`}>
                  {format(day, 'EEE', { locale: ar })}
                </span>
                <span className={`text-3xl font-black tabular-nums ${active ? 'text-black' : 'text-white'}`}>
                  {format(day, 'd')}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Slots Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-white/20 px-4">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Available Slots</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {slots.map((slot, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => onSelectSlot(selectedDate, slot, isEmergency)}
                className="group relative h-20 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-lg font-black text-white group-hover:text-primary transition-colors tabular-nums">{slot}</span>
                <Zap size={14} className="text-white/10 group-hover:text-primary animate-pulse" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
