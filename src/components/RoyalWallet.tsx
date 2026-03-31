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
 * المحفظة الملكية السيادية الممتدة (Royal Wallet Max Viewport).
 * تم التوسعة لتناسب العرض الكامل للشاشة بأسلوب سينمائي ضخم.
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 text-right" dir="rtl">
      
      {/* Sovereign Card - Expanded Scale */}
      <motion.div 
        whileHover={{ scale: 1.005 }}
        className="relative group overflow-hidden bg-[#111] border border-white/5 p-16 md:p-24 rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-indigo-600/5 opacity-50" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-20">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.8)]" />
              <p className="text-white/40 text-xs font-black tracking-[0.5em] uppercase">Supreme Liquidity Core v4.5</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-[10rem] md:text-[12rem] font-black text-white tracking-tighter tabular-nums leading-none flex items-baseline gap-8">
                {balance === Infinity ? "∞" : balance.toLocaleString()} 
                <span className="text-5xl text-primary font-black uppercase tracking-[0.3em]">Units</span>
              </h2>
              <p className="text-2xl text-white/20 font-bold max-w-xl">الرصيد السيادي المتاح حالياً لكافة العمليات الإدارية والقانونية داخل الكوكب.</p>
            </div>
            
            {/* Escrow Balance Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6 text-white/60 text-xl bg-white/[0.02] backdrop-blur-3xl w-fit px-10 py-5 rounded-[2.5rem] border border-white/5 shadow-2xl"
            >
              <ShieldCheck size={28} className="text-primary" />
              <span className="font-bold">المبالغ تحت الحماية البرمجية: <strong className="text-white tabular-nums text-2xl">{escrowBalance} EGP</strong></span>
            </motion.div>
          </div>

          <div className="flex flex-col gap-6 w-full xl:w-[400px]">
             <Link href="/pricing" className="w-full">
               <button className="w-full h-32 bg-primary text-[#020617] font-black text-3xl rounded-[3.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 shadow-[0_30px_60px_rgba(255,87,34,0.3)] group">
                  <Zap size={40} fill="currentColor" className="group-hover:animate-pulse" /> 
                  {isAdmin || isExpert ? 'إدارة الأصول' : 'شحن المحفظة'}
               </button>
             </Link>
             <button className="w-full h-24 bg-white/5 text-white/40 font-black text-lg rounded-[2.5rem] border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-4">
                <FileText size={32} /> تقرير مالي موثق (PDF)
             </button>
          </div>
        </div>
      </motion.div>

      {/* Expanded Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <motion.div whileHover={{ y: -10 }} className="bg-[#111] border border-primary/20 p-12 rounded-[4rem] flex items-center justify-between group overflow-hidden relative shadow-2xl">
            <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:opacity-10 transition-opacity duration-700 scale-150">
               <Crown size={250} className="text-primary" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Crown size={24} /></div>
                <h4 className="text-primary font-black text-3xl tracking-tight">بروتوكول الملكية</h4>
              </div>
              <p className="text-white/40 font-bold text-xl max-w-xs">فعل باقة الـ VIP لتحصل على أولوية قصوى في مجلس الخبراء.</p>
            </div>
            <button className="relative z-10 bg-primary text-black font-black px-12 py-5 rounded-3xl text-sm hover:scale-110 transition-all shadow-3xl">تفعيل الآن</button>
         </motion.div>

         <motion.div whileHover={{ y: -10 }} className="bg-[#111] border border-indigo-500/20 p-12 rounded-[4rem] flex items-center justify-between group overflow-hidden relative shadow-2xl">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4 mb-2 text-indigo-400">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20"><Percent size={24} /></div>
                <h4 className="font-black text-3xl tracking-tight">نظام التقسيط</h4>
              </div>
              <p className="text-white/40 font-bold text-xl max-w-xs">تفعيل الخصم الشهري الآلي للقضايا الاستراتيجية الكبرى.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer z-10">
              <input type="checkbox" className="sr-only peer" checked={isAutoDraftActive} onChange={() => setIsAutoDraftActive(!isAutoDraftActive)} />
              <div className="w-20 h-12 bg-white/5 border border-white/10 rounded-full peer peer-checked:after:translate-x-[-2rem] rtl:peer-checked:after:translate-x-[-2rem] after:content-[''] after:absolute after:top-[6px] after:right-[6px] after:bg-white/20 after:rounded-full after:h-9 after:w-9 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
            </label>
         </motion.div>
      </div>

    </div>
  );
}
