
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ArrowUpRight, ArrowDownLeft, 
  History, ShieldCheck, FileText, Zap, TrendingUp, 
  ChevronLeft, Wallet, Percent, Crown, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/firebase';
import { roles as ROLES_LIST } from '@/lib/roles';
import Link from 'next/link';

interface RoyalWalletProps {
  userRole: string;
  balance: number;
}

/**
 * المحفظة الملكية السيادية (Royal Sovereign Wallet king2026).
 * واجهة مالية متطورة تدعم الضمان، التقسيط، والتحليلات.
 */
export default function RoyalWallet({ userRole, balance }: RoyalWalletProps) {
  const [escrowBalance, setEscrowBalance] = useState(450.00); 
  const [isAutoDraftActive, setIsAutoDraftActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isAdmin = userRole === ROLES_LIST.ADMIN;
  const isExpert = userRole === ROLES_LIST.CONSULTANT;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-right" dir="rtl">
      
      {/* Sovereign Card - الكارت الملكي */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="relative group overflow-hidden glass-cosmic border-white/10 p-12 rounded-[4rem] shadow-3xl"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-indigo-600/10 opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">Sovereign Asset Node</p>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-8xl font-black text-white tracking-tighter tabular-nums leading-none">
                {balance === Infinity ? "∞" : balance.toLocaleString()} 
                <span className="text-3xl text-primary font-bold mr-4 uppercase tracking-widest">EGP</span>
              </h2>
              <p className="text-white/20 font-bold text-sm">إجمالي الرصيد المتاح للاستخدام الفوري</p>
            </div>
            
            {/* Escrow Balance - نظام الضمان */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 text-white/60 text-sm bg-white/[0.03] backdrop-blur-xl w-fit px-6 py-3 rounded-2xl border border-white/5 shadow-inner"
            >
              <ShieldCheck size={18} className="text-primary" />
              <span className="font-bold">مبالغ تحت حماية الضمان: <strong className="text-white tabular-nums">{escrowBalance} EGP</strong></span>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4 w-full lg:w-80">
             <Link href="/pricing" className="w-full">
               <button className="w-full h-20 bg-primary text-[#020617] font-black text-xl rounded-3xl hover:scale-105 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-primary/20 group">
                  <Zap size={24} fill="currentColor" className="group-hover:animate-bounce" /> 
                  {isAdmin || isExpert ? 'إدارة الأرباح' : 'شحن سيادي'}
               </button>
             </Link>
             <button className="w-full h-16 bg-white/5 text-white/40 font-black text-sm rounded-2xl border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3">
                <FileText size={20} /> تحميل كشف حساب موثق (PDF)
             </button>
          </div>
        </div>
      </motion.div>

      {/* Smart Widgets - الأدوات الذكية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* VIP Offer Card */}
         <motion.div whileHover={{ y: -5 }} className="bg-primary/5 border border-primary/20 p-8 rounded-[3rem] flex items-center justify-between group overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Crown size={150} className="text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="text-primary h-5 w-5" />
                <h4 className="text-primary font-black text-xl">عرض السيادة المتاح</h4>
              </div>
              <p className="text-white/40 font-bold text-sm">اشحن بـ ٥٠٠ EGP واحصل على باقة "الجنايات" مجاناً.</p>
            </div>
            <button className="relative z-10 bg-primary text-black font-black px-8 py-3 rounded-xl text-xs hover:scale-110 transition-all shadow-xl">تفعيل</button>
         </motion.div>

         {/* Installments Card */}
         <motion.div whileHover={{ y: -5 }} className="bg-indigo-500/5 border border-indigo-500/20 p-8 rounded-[3rem] flex items-center justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2 text-indigo-400">
                <Percent className="h-5 w-5" />
                <h4 className="font-black text-xl">بروتوكول التقسيط</h4>
              </div>
              <p className="text-white/40 font-bold text-sm">متاح للقضايا الاستراتيجية (خصم شهري آلي).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer z-10">
              <input type="checkbox" className="sr-only peer" checked={isAutoDraftActive} onChange={() => setIsAutoDraftActive(!isAutoDraftActive)} />
              <div className="w-14 h-8 bg-white/5 border border-white/10 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-[-1.5rem] rtl:peer-checked:after:translate-x-[-1.5rem] after:content-[''] after:absolute after:top-[4px] after:right-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
            </label>
         </motion.div>
      </div>

      {/* Analytics for Admin/Expert */}
      {(isAdmin || isExpert) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.02] border border-white/5 p-10 rounded-[3.5rem] shadow-inner">
           <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 text-emerald-500">
                   <TrendingUp className="h-6 w-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sovereign Growth Analytics</p>
                </div>
                <h3 className="text-4xl font-black text-white tracking-tight">
                  زيادة في الدخل بنسبة <span className="text-emerald-500 text-5xl">٢٤%</span> هذا الشهر
                </h3>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} transition={{ duration: 2 }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <div className="text-[10px] text-white/10 font-black italic whitespace-nowrap bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                 LAST SYNC: {new Date().toLocaleTimeString('ar-EG')}
              </div>
           </div>
        </motion.div>
      )}

      {/* Transaction History - سجل الحركات */}
      <div className="bg-[#05050a] border border-white/5 rounded-[4rem] p-10 shadow-3xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 shadow-inner">
               <History size={24} />
            </div>
            <h3 className="text-3xl font-black text-white">سجل العمليات</h3>
          </div>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Records</button>
        </div>
        
        <div className="space-y-4">
          <TransactionItem label="استشارة عقارية موثقة" amount="-250" status="Escrow Protected" date="اليوم" icon={<ShieldCheck />} color="amber" />
          <TransactionItem label="شحن محفظة سيادي (فوري)" amount="+1500" status="Success" date="أمس" icon={<Zap />} color="emerald" />
          <TransactionItem label="إصدار عقد إيجار موحد" amount="-25" status="Success" date="١٤ مارس" icon={<FileText />} color="blue" />
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ label, amount, status, date, icon, color }: any) {
  const colors: any = {
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  };
  return (
    <motion.div 
      whileHover={{ x: -10 }}
      className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-center gap-6">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:rotate-12 ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-white text-lg font-black tracking-tight">{label}</p>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{date}</span>
             <div className="w-1 h-1 bg-white/10 rounded-full" />
             <span className={`text-[9px] font-black uppercase tracking-widest ${status === 'Success' ? 'text-emerald-500' : 'text-primary'}`}>{status}</span>
          </div>
        </div>
      </div>
      <p className={`text-2xl font-black tabular-nums ${amount.startsWith('+') ? 'text-emerald-500' : 'text-white'}`}>
        {amount} <span className="text-[10px] opacity-40">EGP</span>
      </p>
    </motion.div>
  );
}
